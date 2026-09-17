# Database Setup Guide

## Default Database

This application defaults to SQLite/SQLJS for development. PostgreSQL support remains available when the environment variable `DB_TYPE=postgres` is explicitly set.

## Quick Start

### Automated Setup (Recommended)

```bash
# Windows PowerShell (Run as Administrator)
.\scripts\setup-database.ps1

# With custom password
.\scripts\setup-database.ps1 -Password "your_password"

# Skip migrations (if already run)
.\scripts\setup-database.ps1 -SkipMigrate
```

### Manual Setup

See README.md section "PostgreSQL Setup (Default)" for detailed instructions.

---

## Current Configuration

### Database: PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: pmix_dev
- **Username**: postgres
- **Password**: root (configured in .env)
- **Status**: ✅ Running and tested

### Connection Details
- **Backend URL**: http://localhost:1457
- **Health Check**: http://localhost:1457/health
- **Database Driver**: pg (PostgreSQL)
- **ORM**: TypeORM v1.1.1

---

## Verified Setup

### ✅ Completed Steps

1. **PostgreSQL Installation**
   - Version: PostgreSQL 18.4
   - Service: Running on port 5432
   - User: postgres

2. **Database Creation**
   - Database: pmix_dev ✅
   - Owner: postgres ✅
   - Schema: public ✅

3. **Privileges & Permissions**
   - Database privileges: GRANTED ✅
   - Schema privileges: GRANTED ✅
   - Search path: public ✅

4. **Migrations**
   - Migration table created ✅
   - Settings table: created ✅
   - Audit logs table: created ✅
   - Auth tables: created ✅
   - Total migrations executed: 2 ✅

5. **Application**
   - Backend server: Running ✅
   - Health check: Passing ✅
   - Database connection: Working ✅

---

## Database Schema

### Tables Created

1. **migrations** - TypeORM migration tracking
   - id (SERIAL PRIMARY KEY)
   - timestamp (bigint)
   - name (varchar)

2. **settings** - Application settings
   - id (varchar(36) PRIMARY KEY) - UUID
   - tenant_id (varchar(255))
   - category (varchar(50))
   - key (varchar(100))
   - value (jsonb) - JSON data
   - is_encrypted (boolean)
   - description (text)
   - created_at (timestamp)
   - updated_at (timestamp)
   - deleted_at (timestamp, nullable)

3. **audit_logs** - Audit trail
   - id (varchar(36) PRIMARY KEY) - UUID
   - tenant_id (varchar(255))
   - user_id (varchar(36), nullable)
   - action (varchar(50))
   - resource_type (varchar(50))
   - resource_id (varchar(255))
   - old_values (jsonb, nullable)
   - new_values (jsonb, nullable)
   - ip_address (varchar(45))
   - user_agent (text)
   - timestamp (timestamp)

4. **users** - User accounts
5. **refresh_tokens** - JWT refresh tokens
6. **sessions** - User sessions
7. **password_history** - Password change history
8. **tenants** - Multi-tenant organizations
9. **user_metadata** - Additional user information
10. **user_preferences** - User preferences (JSON)

### Key Features

- **UUID Primary Keys**: All tables use `varchar(36)` UUIDs generated at application level
- **Multi-tenant**: `tenant_id` column for data isolation
- **Soft Deletes**: `deleted_at` timestamp column
- **Audit Trail**: `created_at`, `updated_at` timestamps
- **JSON Storage**: `jsonb` for flexible data storage (PostgreSQL native)

---

## Testing

### Health Check
```bash
curl http://localhost:1457/health
# Expected: {"status": true}
```

### Database Connection Test
```bash
# Start backend
pnpm --filter backend run start:dev

# Test in another terminal
curl http://localhost:1457/health
```

### Verify Tables
```bash
psql -U postgres -d pmix_dev -c "\dt"
```

### Test API Endpoints
```bash
# Register user (example)
curl -X POST http://localhost:1457/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

---

## Troubleshooting

### PostgreSQL Service Not Running
```bash
# Windows - Start PostgreSQL service
net start postgresql-x64-18

# Or via PowerShell
Start-Service postgresql-x64-18
```

### Connection Refused
1. Check PostgreSQL is running: `psql -U postgres -c "SELECT 1;"`
2. Check port 5432 is not blocked
3. Verify `DB_HOST` and `DB_PORT` in `.env`

### Migration Failures
```bash
# Rollback and retry
pnpm db:rollback
pnpm db:migrate
```

### Permission Denied
```bash
# Re-run setup script
.\scripts\setup-database.ps1 -Password "root"
```

---

## Development Workflow

### Daily Development
```bash
# 1. Start PostgreSQL (if not running)
net start postgresql-x64-18

# 2. Start backend
pnpm --filter backend run start:dev

# 3. Start frontend (in new terminal)
pnpm --filter frontend run dev

# 4. Access application
# Frontend: http://localhost:1458
# Backend API: http://localhost:1457
# Health: http://localhost:1457/health
```

### Creating New Migrations
```bash
# Generate migration from entity changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Rollback last migration
pnpm db:rollback
```

### Database Backup
```bash
# Backup
pg_dump -U postgres -d pmix_dev > backup.sql

# Restore
psql -U postgres -d pmix_dev < backup.sql
```

---

## Environment Variables

### .env Configuration
```env
# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
DB_DATABASE=pmix_dev
DB_SSL=false

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d

# Application
NODE_ENV=development
PORT=8080
```

---

## Notes

- **Default Database**: PostgreSQL (not SQLite)
- **UUID Generation**: Application-level (works in both PostgreSQL and SQLite)
- **JSON Storage**: jsonb (PostgreSQL native JSON)
- **Migrations**: Database-agnostic with conditional types
- **No Docker Required**: All services run locally

---

## Support

For issues or questions:
1. Check README.md PostgreSQL section
2. Review troubleshooting section above
3. Check PostgreSQL logs: `C:\Program Files\PostgreSQL\18\data\log\`
4. Check application logs in console output

---

**Last Updated**: 2026-09-11
**Status**: Production Ready ✅
