# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `tools/scripts/pmix.cjs` � Cross-platform CLI for managing the PMIX lifecycle.
- `pmix dev` � Start development environment (backend + frontend with hot reload).
- `pmix build` � Build backend and frontend for production.
- `pmix start` � Start production environment (compiled backend + next start).
- `pmix stop` � Stop current environment.
- `pmix restart` � Restart current environment (preserves runtime mode).
- `pmix status` � Show service status and runtime mode.
- `.pmix-processes.json` state tracking with runtime mode (development/production).
- Process tree killing on Windows (`taskkill /T`) and Unix (process group `SIGTERM`/`SIGKILL`).
- Idempotent `stop` and duplicate-start prevention.
- Graceful shutdown on `SIGINT`/`SIGTERM` with rollback if frontend spawn fails.
- Root `package.json` `bin` entry for direct `pmix` executable.

### Changed
- Separated development (`pmix dev`) and production (`pmix start`) runtime semantics.
- Updated README with clear dev/prod sections and consistent commands.
- 
- Simplified CLI - use pmix directly.
- Fixed TypeScript build for production.
- Backend now outputs .js files.
- Production build works correctly.

### Fixed
- Fixed database persistence issue by enabling sqljs auto-save with 5-second interval
- Fixed duplicate `bootstrap()` call in `main.ts` that caused EADDRINUSE errors
- Resolved port conflicts by changing default port from 3000 to 5000
- Fixed TypeOrmModule access error by removing custom save logic (auto-save now handles persistence)
- Database now persists data across server restarts using sqljs with auto-save configuration
- Added `location` parameter to sqljs driver for proper file-based persistence
- Enabled `synchronize: true` for automatic table creation in development
- Created missing root `tsconfig.json` to fix frontend `extends` resolution error
- Fixed frontend API port mismatch (`.env.local`: `1459` → `1457`) to match backend
- Corrected hardcoded API fallback in `products-page.tsx` (`4081` → `1457/api/v1`)
- Fixed root `.env` port (`1459` → `1457`) and removed duplicate `NEXT_PUBLIC_API_URL`
- Added auth token to product API requests in `products-page.tsx` to fix 401 errors
- Made `tenant_id` nullable in `TenantEntity` to fix schema sync on existing SQLite data
- Fixed sqljs persistence in `data-source.ts` by adding `autoSave` and `location` config
- Replaced invalid bcrypt hash in seed script with valid hash for `admin123`
- Removed duplicate JSON object in `apps/frontend/tsconfig.json`

## [0.3.0] - 2026-09-08

### Added
- Users module implementation with comprehensive profile management
- User profile CRUD operations (get, update)
- User preferences management (theme, language, timezone, notifications)
- User metadata storage with key-value pattern
- Advanced user search with multiple filters (role, status, date range)
- Multi-tenant user data isolation
- Soft delete support for user management
- Email uniqueness validation on profile updates
- Input validation with class-validator decorators
- Swagger API documentation for all endpoints
- Repository pattern implementation for testability
- Service layer for business logic separation
- Comprehensive error handling (NotFoundException, ConflictException)
- Audit timestamps (created_at, updated_at) for all user-related tables

### Changed
- Database schema extended with 3 new tables: user_preferences, user_metadata
- User entity extended with profile fields (bio, phone, avatar, etc.)
- All user operations now support multi-tenant architecture
- Password and sensitive fields automatically excluded from profile responses

### Security
- All user endpoints protected by JwtAuthGuard and TenantGuard
- Email verification status reset when email is changed
- Input sanitization and validation on all endpoints

## [0.2.0] - 2026-09-08

### Added
- Settings module implementation with full CRUD operations
- Multi-tenant settings management with tenant isolation
- Settings encryption for sensitive data (passwords, API keys)
- Comprehensive audit logging for all settings changes
- Transaction-based updates for data consistency
- Cache layer for optimized settings retrieval
- Database indexes and constraints for performance
- Settings initialization with default values per category
- Soft delete support for settings retention

### Changed
- Database migration execution now uses pre-compiled CommonJS approach for TypeScript 6.x compatibility
- All repository methods now support transaction operations via EntityManager

## [0.1.0] - 2026-09-07

### Added
- Authentication module with JWT-based authentication
- User registration and login endpoints
- Password hashing with bcrypt
- Refresh token mechanism
- Account lockout protection after failed login attempts
- Email verification support
- Password reset functionality
- Role-based access control (Admin, Manager, User)
- Password history tracking
- Session management

