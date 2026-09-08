# 🚀 Getting Started with Enterprise Structure

## Langkah 1: Install Dependencies

```bash
pnpm install
```

## Langkah 2: Setup Environment Variables

### Backend
```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env` dan sesuaikan dengan konfigurasi lokal Anda.

### Frontend
```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

### Root (opsional)
```bash
cp .env.example .env
```

## Langkah 3: Setup Database

Pastikan PostgreSQL sudah terinstall dan running:

1. **Buat database** menggunakan pgAdmin atau command line:
   ```sql
   CREATE DATABASE mixer_dev;
   ```

2. **Verify koneksi** di `apps/backend/.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=mixer
   DB_PASSWORD=mixer123
   DB_DATABASE=mixer_dev
   ```

## Langkah 4: Run Database Migrations

```bash
pnpm db:migrate
```

## Langkah 5: Start Development

### Option A: Run All Apps (Recommended)
```bash
pnpm dev
```

Ini akan menjalankan:
- Backend (NestJS) di http://localhost:3000/api/v1
- Frontend (Next.js) di http://localhost:4080

### Option B: Run Separately

Terminal 1 - Backend:
```bash
pnpm --filter backend run start:dev
```

Terminal 2 - Frontend:
```bash
pnpm --filter frontend run dev
```

## Langkah 6: Verify Installation

### Backend Health Check
```bash
curl http://localhost:3000/api/v1/health
```

### Frontend
Buka browser ke http://localhost:4080

## 📚 Project Structure Overview

```
mixer/
├── apps/
│   ├── backend/           # NestJS API Server
│   └── frontend/          # Next.js Web App
├── packages/
│   ├── shared-types/      # TypeScript interfaces
│   ├── shared-ui/         # UI components
│   └── shared-utils/      # Utilities
├── docs/                  # Documentation
├── tools/                 # Dev tools
└── .github/               # CI/CD workflows
```

## 🛠️ Available Commands

### Root Level
```bash
pnpm build          # Build all apps
pnpm dev            # Run all apps in dev mode
pnpm lint           # Lint all packages
pnpm test           # Run all tests
pnpm type-check     # Type check all packages
pnpm clean          # Clean build artifacts
```

### Backend
```bash
pnpm --filter backend run start:dev      # Start dev server
pnpm --filter backend run test           # Run tests
pnpm --filter backend run db:migrate     # Run migrations
```

### Frontend
```bash
pnpm --filter frontend run dev           # Start dev server
pnpm --filter frontend run build         # Build for production
pnpm --filter frontend run lint          # Lint code
```

## 🔧 IDE Setup

### VS Code
1. Install extensions:
   - ESLint
   - Prettier
   - Thunder Client (untuk API testing)

2. Settings sudah dikonfigurasi di `.vscode/settings.json`

## 🧪 Testing

### Backend Tests
```bash
# Unit tests
pnpm --filter backend run test

# E2E tests
pnpm --filter backend run test:e2e

# With coverage
pnpm --filter backend run test:cov
```

### Frontend Tests
```bash
# Unit tests
pnpm --filter frontend run test

# Watch mode
pnpm --filter frontend run test:watch
```

## 📊 Database Access

### PostgreSQL
- Host: localhost
- Port: 5432
- User: mixer
- Password: mixer123
- Database: mixer_dev

### pgAdmin (Database Management UI)
- URL: http://localhost:5050
- Email: admin@mixer.com
- Password: admin123

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :4080

# Kill process (Windows)
taskkill /PID <process-id> /F
```

### Database Connection Error
Pastikan PostgreSQL sudah running:

```bash
# Check if PostgreSQL is running (Windows)
Get-Service -Name "postgresql*" | Select-Object Name, Status

# Start PostgreSQL service if not running
Start-Service -Name "postgresql-x64-16"
```

### Module Not Found
```bash
# Clear cache and reinstall
pnpm clean
pnpm install
```

### TypeScript Errors
```bash
# Type check
pnpm type-check

# If still errors, restart TypeScript server in VS Code
# Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

## 📖 Next Steps

1. Read [System Architecture](./docs/architecture/system-architecture.md)
2. Explore the [shared-types](./packages/shared-types/) package
3. Check out existing [modules](./apps/backend/src/modules/)
4. Review [API Documentation](./docs/api/) (coming soon)

## 🤝 Need Help?

- Check [Documentation](./docs/)
- Review [Migration Guide](./docs/adr/MIGRATION.md)
- Create an issue in the repository

---

**Happy Coding! 🚀**