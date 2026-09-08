# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
