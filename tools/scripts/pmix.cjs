#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const STATE_FILE = path.join(ROOT_DIR, '.pmix-processes.json');
const BACKEND_PORT = 1457;
const FRONTEND_PORT = 1458;
const SHUTDOWN_TIMEOUT = 5000;
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

let shuttingDown = false;
let backendProcess = null;
let frontendProcess = null;

function log(message) { console.log(`[pmix] ${message}`); }
function logError(message) { console.error(`[pmix] ${message}`); }
function readState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;
    const data = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch { return null; }
}

function writeState(backendPid, frontendPid) {
  const state = {
    backend: { pid: backendPid },
    frontend: { pid: frontendPid },
    startedAt: new Date().toISOString()
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function removeState() {
  try { if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE); } catch {}
}

function isProcessAlive(pid) {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function killProcessTree(pid) {
  return new Promise((resolve) => {
    if (!isProcessAlive(pid)) { resolve(); return; }

    if (process.platform === 'win32') {
      const taskkill = spawn('taskkill', ['/PID', pid.toString(), '/T'], { stdio: 'ignore', windowsHide: true });
      taskkill.on('close', (code) => {
        if (code === 0) { resolve(); return; }
        const forceKill = spawn('taskkill', ['/PID', pid.toString(), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
        forceKill.on('close', () => resolve());
        forceKill.on('error', () => resolve());
      });
      taskkill.on('error', () => {
        const forceKill = spawn('taskkill', ['/PID', pid.toString(), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
        forceKill.on('close', () => resolve());
        forceKill.on('error', () => resolve());
      });
    } else {
      try { process.kill(-pid, 'SIGTERM'); } catch {
        try { process.kill(pid, 'SIGTERM'); } catch {}
      }
      setTimeout(() => {
        if (isProcessAlive(pid)) {
          try { process.kill(-pid, 'SIGKILL'); } catch {
            try { process.kill(pid, 'SIGKILL'); } catch {}
          }
        }
        resolve();
      }, SHUTDOWN_TIMEOUT);
      setTimeout(resolve, SHUTDOWN_TIMEOUT + 500);
    }
  });
}

async function stopService(name, processObj, pid) {
  if (!pid) return;
  log(`Stopping ${name} (PID: ${pid})...`);
  if (processObj) {
    try { processObj.kill('SIGTERM'); } catch {}
  }
  await killProcessTree(pid);
  if (isProcessAlive(pid)) {
    logError(`Warning: ${name} (PID: ${pid}) may still be running`);
  } else {
    log(`${name} stopped`);
  }
}

async function startDev() {
  log('Starting PMIX development environment...');
  const existingState = readState();

  if (existingState) {
    const backendAlive = existingState.backend?.pid && isProcessAlive(existingState.backend.pid);
    const frontendAlive = existingState.frontend?.pid && isProcessAlive(existingState.frontend.pid);

    if (backendAlive || frontendAlive) {
      logError('PMIX is already running. Use "pnpm pmix stop" first.');
      logError(`  Backend PID: ${existingState.backend?.pid || 'unknown'} ${backendAlive ? '(running)' : '(dead)'}`);
      logError(`  Frontend PID: ${existingState.frontend?.pid || 'unknown'} ${frontendAlive ? '(running)' : '(dead)'}`);
      process.exit(1);
    }
    log('Cleaning stale state file...');
    removeState();
  }
  log('Starting backend...');
  backendProcess = spawn(
    pnpmCommand,
    ['--filter', 'backend', 'run', 'start:dev'],
    {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      detached: process.platform !== 'win32',
      shell: process.platform === 'win32'
    }
  );

  backendProcess.on('error', (error) => {
    logError(`Failed to start backend: ${error.message}`);
    cleanupAndExit(1);
  });

  backendProcess.on('exit', (code, signal) => {
    if (!shuttingDown && code !== null && code !== 0) {
      logError(`Backend exited unexpectedly with code ${code}${signal ? ` and signal ${signal}` : ''}`);
      logError('Check backend logs for details.');
      cleanupAndExit(1);
    }
  });
  await new Promise(resolve => setTimeout(resolve, 2000));
  if (!isProcessAlive(backendProcess.pid)) {
    logError('Backend failed to start. Check for errors above.');
    cleanupAndExit(1);
  }

  log('Starting frontend...');
  frontendProcess = spawn(
    pnpmCommand,
    ['--filter', 'frontend', 'run', 'dev'],
    {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      detached: process.platform !== 'win32',
      shell: process.platform === 'win32'
    }
  );

  frontendProcess.on('error', async (error) => {
    logError(`Failed to start frontend: ${error.message}`);
    log('Rolling back: stopping backend...');
    await stopService('Backend', backendProcess, backendProcess?.pid);
    cleanupAndExit(1);
  });

  frontendProcess.on('exit', (code, signal) => {
    if (!shuttingDown && code !== null && code !== 0) {
      logError(`Frontend exited unexpectedly with code ${code}${signal ? ` and signal ${signal}` : ''}`);
      logError('Check frontend logs for details.');
      cleanupAndExit(1);
    }
  });
  await new Promise(resolve => setTimeout(resolve, 2000));
  if (!isProcessAlive(frontendProcess.pid)) {
    logError('Frontend failed to start. Check for errors above.');
    await stopService('Backend', backendProcess, backendProcess?.pid);
    cleanupAndExit(1);
  }

  writeState(backendProcess.pid, frontendProcess.pid);

  log('');
  log('PMIX development environment started!');
  log(`  Backend:  http://localhost:${BACKEND_PORT}`);
  log(`  Frontend: http://localhost:${FRONTEND_PORT}`);
  log('');
}

async function stop() {
  log('Stopping PMIX...');
  const state = readState();

  if (!state) {
    log('No PMIX processes found. Already stopped.');
    removeState();
    return;
  }

  const promises = [];
  if (state.backend?.pid) {
    const processObj = (backendProcess && backendProcess.pid === state.backend.pid) ? backendProcess : null;
    promises.push(stopService('Backend', processObj, state.backend.pid));
  }
  if (state.frontend?.pid) {
    const processObj = (frontendProcess && frontendProcess.pid === state.frontend.pid) ? frontendProcess : null;
    promises.push(stopService('Frontend', processObj, state.frontend.pid));
  }

  await Promise.all(promises);
  removeState();
  log('PMIX stopped.');
}

async function restart() {
  log('Restarting PMIX...');
  await stop();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await startDev();
}

function status() {
  log('PMIX Status:');
  log('');
  const state = readState();

  if (!state) {
    log('  Status: Not running');
    log('  No state file found.');
    process.exit(0);
  }

  const backendAlive = state.backend?.pid ? isProcessAlive(state.backend.pid) : false;
  const frontendAlive = state.frontend?.pid ? isProcessAlive(state.frontend.pid) : false;

  log('  Backend:');
  log(`    PID: ${state.backend?.pid || 'unknown'}`);
  log(`    Status: ${backendAlive ? 'Running' : 'Stopped/Dead'}`);
  log(`    URL: http://localhost:${BACKEND_PORT}`);
  log('');
  log('  Frontend:');
  log(`    PID: ${state.frontend?.pid || 'unknown'}`);
  log(`    Status: ${frontendAlive ? 'Running' : 'Stopped/Dead'}`);
  log(`    URL: http://localhost:${FRONTEND_PORT}`);
  log('');
  log(`  Started: ${state.startedAt || 'unknown'}`);
  log('');

  if (!backendAlive || !frontendAlive) {
    log('  Warning: Some processes are not running. State file may be stale.');
    log('  Run "pnpm pmix stop" to clean up.');
  }
}

function usage() {
  console.log('');
  console.log('Usage: pnpm pmix [command]');
  console.log('');
  console.log('Commands:');
  console.log('  dev, start    Start development environment (backend + frontend)');
  console.log('  stop          Stop development environment');
  console.log('  restart       Restart development environment');
  console.log('  status        Show status of PMIX processes');
  console.log('');
  console.log('Examples:');
  console.log('  pnpm pmix dev');
  console.log('  pnpm pmix stop');
  console.log('  pnpm pmix status');
  console.log('');
}

async function cleanupAndExit(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  log('Cleaning up...');

  const promises = [];
  if (backendProcess) {
    promises.push(stopService('Backend', backendProcess, backendProcess.pid));
  } else {
    const state = readState();
    if (state?.backend?.pid) promises.push(stopService('Backend', null, state.backend.pid));
  }
  if (frontendProcess) {
    promises.push(stopService('Frontend', frontendProcess, frontendProcess.pid));
  } else {
    const state = readState();
    if (state?.frontend?.pid) promises.push(stopService('Frontend', null, state.frontend.pid));
  }

  await Promise.all(promises);
  removeState();
  process.exit(code);
}

process.on('SIGINT', () => {
  log('Received SIGINT, shutting down gracefully...');
  cleanupAndExit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down gracefully...');
  cleanupAndExit(0);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  cleanupAndExit(1);
});

process.on('unhandledRejection', (reason) => {
  logError(`Unhandled rejection: ${reason}`);
  cleanupAndExit(1);
});

async function main() {
  const command = (process.argv[2] || 'dev').toLowerCase();
  switch (command) {
    case 'dev':
    case 'start':
      await startDev();
      break;
    case 'stop':
      await stop();
      break;
    case 'restart':
      await restart();
      break;
    case 'status':
      status();
      break;
    default:
      logError(`Unknown command: ${command}`);
      usage();
      process.exit(1);
  }
}

main().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  cleanupAndExit(1);
});
