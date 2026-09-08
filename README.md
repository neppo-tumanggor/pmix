# Mixer - Enterprise Marketing Automation Platform

Enterprise-grade monorepo untuk Marketing Automation Platform menggunakan NestJS (backend) dan Next.js (frontend).

## 📋 Tech Stack

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: Class Validator

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Library**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query

### Infrastructure
- **Package Manager**: PNPM (Workspaces)
- **Build Tool**: Turborepo
- **CI/CD**: GitHub Actions
- **Testing**: Vitest

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- PNPM >= 9.0.0
- PostgreSQL >= 16.0 (install manually)

### Installation

1. **Clone repository**
```bash
git clone <repository-url> mixer
cd mixer
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment variables**
```bash
# Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
cp .env.example .env
```

4. **Start PostgreSQL database**
   
   Pastikan PostgreSQL sudah terinstall dan running di port 5432.
   
   Buat database dengan nama `mixer_dev`:
   ```sql
   CREATE DATABASE mixer_dev;
   ```

5. **Run database migrations**
```bash
pnpm db:migrate
```

6. **Start development servers**
```bash
# Start all apps (backend + frontend)
pnpm dev

# Atau jalankan secara terpisah:
pnpm --filter backend run start:dev  # Backend di http://localhost:3000
pnpm --filter frontend run dev        # Frontend di http://localhost:4080
```

## 📁 Project Structure

```
mixer/
├── apps/
│   ├── backend/           # NestJS API
│   │   ├── src/
│   │   │   ├── common/    # Shared utilities (guards, interceptors, etc)
│   │   │   ├── config/    # Configuration files
│   │   │   ├── modules/   # Feature modules (DDD pattern)
│   │   │   ├── infrastructure/  # External services
│   │   │   └── shared/    # Shared backend code
│   │   ├── test/          # Backend tests
│   │   ├── migrations/    # Database migrations
│   │
│   └── frontend/          # Next.js App
│       ├── src/
│       │   ├── app/       # Next.js App Router
│       │   ├── components/# React components
│       │   ├── hooks/     # Custom hooks
│       │   ├── lib/       # Utilities & API client
│       │   ├── stores/    # State management
│       │   └── types/     # TypeScript types
│
├── packages/
│   ├── shared-types/      # Shared TypeScript types
│   ├── shared-ui/         # Shared UI components
│   └── shared-utils/      # Shared utilities
│
├── docs/                  # Documentation
├── tools/                 # Development tools
└── .github/               # CI/CD workflows
```

## 🛠️ Available Scripts

### Root Level
```bash
pnpm build          # Build all apps
pnpm dev            # Run all apps in development
pnpm lint           # Lint all packages
pnpm test           # Run all tests
pnpm type-check     # Type check all packages
pnpm clean          # Clean all build artifacts
pnpm db:migrate     # Run database migrations
pnpm db:seed        # Seed database
```

### Backend Only
```bash
pnpm --filter backend run start:dev      # Start dev server
pnpm --filter backend run test           # Run unit tests
pnpm --filter backend run test:e2e       # Run e2e tests
pnpm --filter backend run db:migrate     # Run migrations
```

### Frontend Only
```bash
pnpm --filter frontend run dev           # Start dev server
pnpm --filter frontend run build         # Build for production
pnpm --filter frontend run lint          # Lint code
pnpm --filter frontend run test          # Run tests
```

## 🧪 Testing

### Backend
```bash
# Unit tests
pnpm --filter backend run test

# E2E tests
pnpm --filter backend run test:e2e

# Coverage
pnpm --filter backend run test:cov
```

### Frontend
```bash
# Unit tests
pnpm --filter frontend run test

# E2E tests (requires Playwright)
pnpm --filter frontend run test:e2e
```

## 📊 Database

### Run Migrations
```bash
pnpm db:migrate
```

### Rollback Migrations
```bash
pnpm db:rollback
```

### Generate Migration
```bash
pnpm db:generate
```

### Seed Database
```bash
pnpm db:seed
```

## 🔧 Development Tools

### Code Generation (Coming Soon)
```bash
pnpm generate:module <name>
pnpm generate:component <name>
```

### Format Code
```bash
pnpm format
```

## 📚 Documentation

- [Architecture](./docs/architecture/system-architecture.md)
- [API Documentation](./docs/api/)
- [Development Guides](./docs/guides/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is private and confidential.

## 👥 Team

Mixer Development Team

---

For more information, see [docs/](./docs/)
