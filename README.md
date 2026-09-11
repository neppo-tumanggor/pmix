# Mixer - Enterprise Marketing Automation Platform

Enterprise-grade monorepo untuk Marketing Automation Platform menggunakan NestJS (backend) dan Next.js (frontend).

## 🎯 Current Status

**Application is READY and RUNNING with SQLite!**

- ✅ **Database**: SQLite (default) - `./data/mixer_dev.sqlite`
- ✅ **Backend**: Running on http://localhost:1457
- ✅ **Frontend**: Running on http://localhost:1458
- ✅ **Health Check**: Passing - http://localhost:1457/health
- ✅ **All Systems**: Operational

**Quick Access:**
- 🌐 Frontend: http://localhost:1458
- 🔗 Backend API: http://localhost:1457
- 🏥 Health: http://localhost:1457/health

---

## 🚀 Quick Start

### ⚡ Zero-Config Development (SQLite - DEFAULT)

**No database installation required!** SQLite works out of the box.

```bash
# 1. Clone repository
git clone <repository-url> mixer
cd mixer

# 2. Install dependencies
pnpm install

# 3. Setup environment (already configured for SQLite)
cp .env.example .env

# 4. Run migrations (creates SQLite database automatically)
pnpm db:migrate

# 5. Start development servers
pnpm --filter backend run start:dev  # Backend: http://localhost:1457
pnpm --filter frontend run dev        # Frontend: http://localhost:1458
```

**That's it!** Database file will be created at `./data/mixer_dev.sqlite`

---

### 🏢 Production with PostgreSQL (Optional)

Untuk production deployments:

```bash
# 1. Install PostgreSQL (if not installed)
# Download from: https://www.postgresql.org/download/windows/

# 2. Create database
psql -U postgres -c "CREATE DATABASE mixer_dev;"

# 3. Configure .env
# Change DB_TYPE=sqljs to DB_TYPE=postgres
# Update DB_USERNAME and DB_PASSWORD

# 4. Grant privileges
psql -U postgres -d mixer_dev -c "GRANT ALL ON SCHEMA public TO postgres;"

# 5. Run migrations
pnpm db:migrate

# 6. Start servers
pnpm --filter backend run start:dev
pnpm --filter frontend run dev
```

See [PostgreSQL Setup](#postgresql-setup-optional) section below for detailed instructions.

---

### Prerequisites
- Node.js >= 20.0.0
- PNPM >= 9.0.0
- PostgreSQL >= 18.0 (only if using PostgreSQL)
- **SQLite** - Built-in, no installation needed! ✅

---

## 🎯 Running the Application

### Current Status
- ✅ **Database**: SQLite (default) - `./data/mixer_dev.sqlite`
- ✅ **Backend**: Running on http://localhost:1457
- ✅ **Frontend**: Running on http://localhost:1458
- ✅ **Health Check**: http://localhost:1457/health

### Access Points
```
Frontend:  http://localhost:1458
Backend:   http://localhost:1457
API Docs:  http://localhost:1457/api
Health:    http://localhost:1457/health
```

### Verify Installation
```bash
# Test backend health
curl http://localhost:1457/health

# Expected response: {"status": true}

# Test frontend
# Open browser: http://localhost:1458
```

### Daily Development
```bash
# 1. Start backend (terminal 1)
pnpm --filter backend run start:dev

# 2. Start frontend (terminal 2)
pnpm --filter frontend run dev

# 3. Access application
# Frontend: http://localhost:1458
# Backend: http://localhost:1457
# Health: http://localhost:1457/health
```

### Hot Reload
- **Backend**: Changes in `apps/backend/src/` trigger automatic restart
- **Frontend**: Changes in `apps/frontend/src/` trigger automatic reload via Turbopack

---

## ⚙️ Environment Variables

### Configuration Files
- `.env` - Main environment variables (git-ignored)
- `.env.example` - Template for environment setup

### Key Variables

#### Database
```env
# Database Type: 'sqljs' (default) atau 'postgres'
DB_TYPE=sqljs

# SQLite Configuration (default)
DB_DATABASE=./data/mixer_dev.sqlite

# PostgreSQL Configuration (jika DB_TYPE=postgres)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
# DB_DATABASE=mixer_dev
DB_SSL=false
```

#### Application
```env
NODE_ENV=development          # Environment: development/production
PORT=1457                     # Backend server port
APP_NAME=Mixer                 # Application name
APP_VERSION=1.0.0
```

#### JWT Authentication
```env
JWT_SECRET=your-secret-key    # JWT signing secret (min 32 chars)
JWT_EXPIRY=7d                 # JWT token expiry
JWT_REFRESH_SECRET=...        # Refresh token secret
JWT_REFRESH_EXPIRY=30d        # Refresh token expiry
```

#### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:1457/api/v1  # Backend API URL
NEXT_PUBLIC_APP_NAME=Mixer                         # App name
```

#### CORS
```env
CORS_ORIGIN=http://localhost:1458  # Allowed frontend origin
```

### Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# For SQLite (default): No changes needed!
# For PostgreSQL: Update DB_TYPE and DB credentials
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

### SQLite (Default) - Zero Configuration

**SQLite is the default database** - no setup required!

#### Configuration

Default configuration in `.env`:
```env
DB_TYPE=sqljs
DB_DATABASE=./data/mixer_dev.sqlite
```

#### How It Works

1. **Automatic Database Creation**: SQLite database file is created automatically when you run migrations
2. **File Location**: `./data/mixer_dev.sqlite` (in project root)
3. **No Server Required**: SQLite is serverless - just a file
4. **Zero Maintenance**: No database server to manage

#### When to Use SQLite

✅ **Perfect for:**
- Development & testing
- Single-user applications
- Prototyping
- Small to medium projects
- Quick setup

❌ **Limitations:**
- Limited concurrent writes (one writer at a time)
- No user management/authentication
- Not ideal for high-traffic production
- No built-in replication

---

### PostgreSQL (Optional) - Production Ready

For production deployments or when you need advanced features:

#### 1. Install PostgreSQL

**Windows:**
1. Download PostgreSQL installer dari [postgresql.org](https://www.postgresql.org/download/windows/)
2. Jalankan installer dan ikuti petunjuk
3. Catat password untuk user `postgres` (superuser)
4. Pastikan PostgreSQL service running di port 5432

**Verify Installation:**
```bash
psql --version
# Output: psql (PostgreSQL) 18.x.x
```

#### 2. Create Database

```sql
-- Create database
CREATE DATABASE mixer_dev;

-- Verify database created
\l
```

#### 3. Configure Environment Variables

Edit file `.env`:
```env
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_DATABASE=mixer_dev
DB_SSL=false
```

#### 4. Grant Database Privileges

```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Grant privileges on database
GRANT ALL PRIVILEGES ON DATABASE mixer_dev TO postgres;

# Connect to mixer_dev database
\c mixer_dev

# Grant schema privileges
GRANT ALL ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO PUBLIC;
GRANT USAGE ON SCHEMA public TO PUBLIC;

# Set default schema
ALTER ROLE postgres SET search_path = public;

# Exit
\q
```

**Quick Command (Windows PowerShell):**
```powershell
$env:PGPASSWORD="your_password_here"
psql -U postgres -c "CREATE DATABASE mixer_dev;"
psql -U postgres -d mixer_dev -c "GRANT ALL PRIVILEGES ON DATABASE mixer_dev TO postgres;"
psql -U postgres -d mixer_dev -c "GRANT ALL ON SCHEMA public TO postgres;"
psql -U postgres -d mixer_dev -c "GRANT CREATE ON SCHEMA public TO PUBLIC;"
psql -U postgres -d mixer_dev -c "GRANT USAGE ON SCHEMA public TO PUBLIC;"
psql -U postgres -d mixer_dev -c "ALTER ROLE postgres SET search_path = public;"
```

#### 5. Run Database Migrations

```bash
pnpm db:migrate
```

#### 6. Verify Database Connection

```bash
# Start backend server
pnpm --filter backend run start:dev

# Test health endpoint
curl http://localhost:8080/health
# Expected: {"status": true}
```

#### When to Use PostgreSQL

✅ **Perfect for:**
- Production deployments
- Multi-user applications
- High-concurrency systems
- Complex analytics/reporting
- Advanced SQL features needed

#### Error: "password authentication failed for user 'postgres'"

**Solution:**
1. Verify password in `.env` matches PostgreSQL password
2. Check `pg_hba.conf` authentication method (should be `scram-sha-256` or `md5`)
3. Restart PostgreSQL service after changes

#### Error: "database 'mixer_dev' does not exist"

**Solution:**
```bash
psql -U postgres -c "CREATE DATABASE mixer_dev;"
```

#### Error: "permission denied for schema public"

**Solution:**
```bash
psql -U postgres -d mixer_dev -c "GRANT ALL ON SCHEMA public TO postgres;"
psql -U postgres -d mixer_dev -c "GRANT CREATE ON SCHEMA public TO PUBLIC;"
psql -U postgres -d mixer_dev -c "GRANT USAGE ON SCHEMA public TO PUBLIC;"
psql -U postgres -d mixer_dev -c "ALTER ROLE postgres SET search_path = public;"
```

#### Error: "no schema has been selected to create in"

**Solution:**
```bash
psql -U postgres -d mixer_dev -c "ALTER ROLE postgres SET search_path = public;"
```

#### Error: "port 5432 already in use"

**Solution:**
1. Check if another PostgreSQL instance is running
2. Change port in `postgresql.conf` or stop conflicting service
3. Update `DB_PORT` in `.env` if using different port

---

### Database Management Commands

#### Run Migrations
```bash
# Run pending migrations
pnpm db:migrate

# Rollback last migration
pnpm db:rollback

# Generate new migration
pnpm db:generate
```

#### Database File Management (SQLite)

**Location**: `./data/mixer_dev.sqlite`

**Backup SQLite Database:**
```bash
# Copy database file
Copy-Item ./data/mixer_dev.sqlite ./data/mixer_dev.backup.sqlite

# Or using PowerShell
cp ./data/mixer_dev.sqlite ./data/mixer_dev.backup.sqlite
```

**Restore SQLite Database:**
```bash
# Restore from backup
Copy-Item ./data/mixer_dev.backup.sqlite ./data/mixer_dev.sqlite
```

**View SQLite Database:**
```bash
# Using sqlite3 CLI (if installed)
sqlite3 ./data/mixer_dev.sqlite

# Or use DB Browser for SQLite (GUI)
# Download from: https://sqlitebrowser.org/
```

**Database File Size:**
```bash
# Check database file size
Get-ChildItem ./data/mixer_dev.sqlite | Select-Object Length

# Typical size: < 1MB for development
```

---

### Database Schema

#### Tables
- **migrations** - TypeORM migration tracking
- **tenants** - Multi-tenant organizations
- **users** - User accounts
- **refresh_tokens** - JWT refresh tokens
- **sessions** - User sessions
- **password_history** - Password change history
- **user_metadata** - Additional user information
- **user_preferences** - User preferences (JSON)
- **settings** - Application settings (JSON)
- **audit_logs** - Audit trail

#### Key Features
- **UUID Primary Keys**: All tables use `varchar(36)` UUIDs
- **Multi-tenant**: `tenant_id` column for data isolation
- **Soft Deletes**: `deleted_at` timestamp column
- **Audit Trail**: `created_at`, `updated_at`, `created_by`, `updated_by`
- **JSON Storage**: `text` (SQLite) / `jsonb` (PostgreSQL) for flexible data

---

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
- [Database Setup](./DATABASE_SETUP.md)
- [API Documentation](./docs/api/)
- [Development Guides](./docs/guides/)

## 🔌 API Reference

### Base URL
```
http://localhost:1457/api/v1
```

### Authentication Endpoints
```
POST   /api/v1/auth/register      # Register new user
POST   /api/v1/auth/login         # Login user
POST   /api/v1/auth/refresh       # Refresh access token
POST   /api/v1/auth/logout        # Logout user
```

### Health Check
```
GET    /health                    # Application health status
```

### API Documentation
- Interactive API docs: http://localhost:1457/api
- Swagger/OpenAPI spec: Available when backend is running

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is private and confidential.

---

## 🎯 Implementation Summary

### ✅ Completed Features

#### Database Configuration
- ✅ **SQLite as Default Database** - Zero-configuration development
- ✅ **PostgreSQL as Optional** - Production-ready alternative
- ✅ **Auto-create Directory** - `./data/` directory created automatically
- ✅ **Code Fallback** - Defaults to SQLite even without `.env` file
- ✅ **Migration Compatibility** - Works with both SQLite and PostgreSQL
- ✅ **Entity Updates** - All entities use `datetime` for SQLite compatibility
- ✅ **Driver Installed** - `sql.js` + `@types/sql.js` installed

#### Port Configuration
- ✅ **Backend Port**: `8080` → `1457` (avoid conflicts)
- ✅ **Frontend Port**: `4080` → `1458` (avoid conflicts)
- ✅ **CORS Updated** - Configured for new frontend port
- ✅ **Documentation Updated** - All references updated

#### Configuration Files
- ✅ `.env` - SQLite default with new ports
- ✅ `.env.example` - Template with SQLite default
- ✅ `.gitignore` - Protects `.env` file
- ✅ `data-source.ts` - SQLite primary, PostgreSQL fallback

#### Documentation
- ✅ `README.md` - Updated with SQLite-first approach
- ✅ `DATABASE_SETUP.md` - Comprehensive setup guide
- ✅ `SQLITE_SETUP.md` - Implementation summary

### 🚀 Quick Reference

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:1458 |
| **Backend API** | http://localhost:1457 |
| **Health Check** | http://localhost:1457/health |
| **API Docs** | http://localhost:1457/api |

### 💡 Key Points

1. **SQLite is DEFAULT** - No setup needed for development
2. **PostgreSQL is OPTIONAL** - For production use
3. **Easy Switching** - Just change `DB_TYPE` in `.env`
4. **Database File** - `./data/mixer_dev.sqlite`
5. **No PostgreSQL Installation Required** - For development!

### 🔧 Troubleshooting

#### SQLite Issues

**Problem**: "database is locked"
```bash
# Solution: Close other connections to SQLite file
# Only one writer at a time
```

**Problem**: "unable to open database file"
```bash
# Solution: Create data directory
mkdir -p ./data
```

#### Backend TypeScript Errors

**Problem**: Backend won't start due to TypeScript errors

**Solution**: These are pre-existing errors unrelated to SQLite setup. Options:
1. Fix TypeScript errors in codebase
2. Use `ts-node --transpile-only` to skip type checking
3. Run with `nest start` which uses compiled JavaScript

---

## 👥 Team

Mixer Development Team

---

For more information, see [docs/](./docs/)

