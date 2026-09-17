const fs = require('fs');
const p = 'D:\pmix\CHANGELOG.md';
let c = fs.readFileSync(p, 'utf8');
const add = `
- **Global CLI access** - pmix command works from any terminal without pnpm prefix.
- pmix.cmd wrapper for Windows CMD compatibility.
- pmix.ps1 wrapper for PowerShell support.
- PowerShell profile function for seamless pmix command integration.
- Auto-installation to C:\Users\USER\AppData\Local\Microsoft\WindowsApps\ for system-wide access.`;
const changed = `
- **Simplified CLI usage** - No need to type pnpm pmix prefix, just pmix directly.
- **Fixed TypeScript build configuration** for production:
  - Backend now compiles to CommonJS .js files instead of ESM .ts files.
  - Added tsconfig.nopaths.json for production builds without path resolution issues.
  - Updated build script to use nest build -b tsc for explicit TypeScript compiler usage.
  - Resolved TypeScript 6.x deprecation warnings with ignoreDeprecations: "6.0".
- **Production build now works** - pmix build successfully creates dist/main.js.
- **Production start now works** - pmix start successfully launches compiled backend.`;
c = c.replace(/(Root `package.json` `bin` entry for direct `pmix` executable\.)/, '$1' + add);
c = c.replace(/(PostgreSQL section now documented as production database configuration, not production runtime\.)/, '$1' + changed);
fs.writeFileSync(p, c);
console.log('CHANGELOG.md updated successfully');
