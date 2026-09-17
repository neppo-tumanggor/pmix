#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup PostgreSQL database untuk pmix project.
.DESCRIPTION
    Script ini akan membantu setup database PostgreSQL untuk development.
.PARAMETER Password
    PostgreSQL postgres user password. Default: root
.PARAMETER SkipMigrate
    Skip running migrations
.EXAMPLE
    .\scripts\setup-database.ps1
#>

param(
    [string]$Password = "root",
    [switch]$SkipMigrate
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  pmix Database Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check PostgreSQL installation
Write-Host "[1/6] Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] PostgreSQL found: $pgVersion" -ForegroundColor Green
    } else {
        throw "PostgreSQL not found in PATH"
    }
} catch {
    Write-Host "  [ERROR] PostgreSQL not found!" -ForegroundColor Red
    Write-Host "  Please install PostgreSQL from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Step 2: Check if .env exists
Write-Host ""
Write-Host "[2/6] Checking .env configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "  [ERROR] .env file not found!" -ForegroundColor Red
    Write-Host "  Please copy .env.example to .env and configure it first." -ForegroundColor Yellow
    exit 1
}

Write-Host "  [OK] .env file found" -ForegroundColor Green

# Load .env file
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

# Verify database configuration
if ($env:DB_TYPE -ne "postgres") {
    Write-Host "  [WARNING] DB_TYPE is not 'postgres' (current: $env:DB_TYPE)" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Step 3: Check PostgreSQL connection
Write-Host ""
Write-Host "[3/6] Testing PostgreSQL connection..." -ForegroundColor Yellow
$env:PGPASSWORD = $Password

try {
    $testQuery = psql -U postgres -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] PostgreSQL connection successful" -ForegroundColor Green
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "  [ERROR] Failed to connect to PostgreSQL!" -ForegroundColor Red
    Write-Host "  Error: $testQuery" -ForegroundColor Yellow
    Write-Host "  Please check:" -ForegroundColor Yellow
    Write-Host "    1. PostgreSQL service is running" -ForegroundColor Yellow
    Write-Host "    2. Username and password are correct in .env" -ForegroundColor Yellow
    Write-Host "    3. PostgreSQL is listening on port $env:DB_PORT" -ForegroundColor Yellow
    exit 1
}

# Step 4: Create database if not exists
Write-Host ""
Write-Host "[4/6] Creating database..." -ForegroundColor Yellow

$dbExists = psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$env:DB_DATABASE'" 2>&1

if ($dbExists -eq "1") {
    Write-Host "  [INFO] Database '$env:DB_DATABASE' already exists" -ForegroundColor Cyan
} else {
    try {
        psql -U postgres -c "CREATE DATABASE $env:DB_DATABASE;" 2>&1 | Out-Null
        Write-Host "  [OK] Database '$env:DB_DATABASE' created successfully" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] Failed to create database: $_" -ForegroundColor Red
        exit 1
    }
}

# Step 5: Grant privileges
Write-Host ""
Write-Host "[5/6] Granting database privileges..." -ForegroundColor Yellow

$grantCommands = @(
    "GRANT ALL PRIVILEGES ON DATABASE $env:DB_DATABASE TO postgres;",
    "GRANT ALL ON SCHEMA public TO postgres;",
    "GRANT CREATE ON SCHEMA public TO PUBLIC;",
    "GRANT USAGE ON SCHEMA public TO PUBLIC;",
    "ALTER ROLE postgres SET search_path = public;"
)

foreach ($cmd in $grantCommands) {
    try {
        psql -U postgres -d $env:DB_DATABASE -c $cmd 2>&1 | Out-Null
    } catch {
        Write-Host "  [WARNING] Failed to execute: $cmd" -ForegroundColor Yellow
    }
}

Write-Host "  [OK] Database privileges granted" -ForegroundColor Green

# Step 6: Run migrations
if (-not $SkipMigrate) {
    Write-Host ""
    Write-Host "[6/6] Running database migrations..." -ForegroundColor Yellow
    
    Push-Location "apps/backend"
    try {
        pnpm run db:migrate
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Migrations completed successfully" -ForegroundColor Green
        } else {
            throw "Migration failed"
        }
    } catch {
        Write-Host "  [ERROR] Migration failed: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
} else {
    Write-Host ""
    Write-Host "[6/6] Skipping migrations (--SkipMigrate flag set)" -ForegroundColor Cyan
}

# Success!
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  [SUCCESS] Database Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend: pnpm --filter backend run start:dev" -ForegroundColor White
Write-Host "  2. Test health: curl http://localhost:8080/health" -ForegroundColor White
Write-Host "  3. Start frontend: pnpm --filter frontend run dev" -ForegroundColor White
Write-Host ""
Write-Host "Database connection details:" -ForegroundColor Cyan
Write-Host "  Host: $env:DB_HOST" -ForegroundColor White
Write-Host "  Port: $env:DB_PORT" -ForegroundColor White
Write-Host "  Database: $env:DB_DATABASE" -ForegroundColor White
Write-Host "  Username: $env:DB_USERNAME" -ForegroundColor White
Write-Host ""
