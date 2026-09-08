# Users Module (v0.3.0)

Module untuk manajemen profil pengguna, preferensi, dan metadata dalam Mixer Marketing Automation Platform.

## ?? Features

- **User Profile Management** - CRUD operations untuk profil pengguna
- **User Preferences** - Manajemen preferensi UI/UX per pengguna
- **User Metadata** - Storage fleksibel untuk data custom per pengguna
- **Multi-tenant Support** - Data isolation per tenant
- **Soft Delete** - Soft delete untuk user management
- **Status Management** - Active, inactive, suspended status
- **Search & Filter** - Advanced search dengan multiple filters
- **Audit Trail** - Created/updated timestamps untuk semua records

## ??? Architecture

```
modules/users/
+-- controllers/           # REST API endpoints
¦   +-- users.controller.ts
+-- dto/                   # Data Transfer Objects
¦   +-- update-profile.dto.ts
+-- entities/              # TypeORM entities
¦   +-- user-preferences.entity.ts
¦   +-- user-metadata.entity.ts
+-- interfaces/            # Repository interfaces
¦   +-- user.repository.interface.ts
¦   +-- user-preferences.repository.interface.ts
¦   +-- user-metadata.repository.interface.ts
+-- repositories/          # Repository implementations
¦   +-- user.repository.ts
¦   +-- user-preferences.repository.ts
¦   +-- user-metadata.repository.ts
+-- services/              # Business logic
¦   +-- users.service.ts
¦   +-- user-preferences.service.ts
¦   +-- user-metadata.service.ts
+-- users.module.ts        # Module definition
```

## ?? API Endpoints

### User Profile
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update current user profile

### User Preferences
- `GET /users/me/preferences` - Get user preferences
- `PATCH /users/me/preferences` - Update user preferences

### User Metadata
- `GET /users/me/metadata` - Get all metadata
- `POST /users/me/metadata` - Set metadata (body: { key, value })
- `DELETE /users/me/metadata/:key` - Delete metadata

## ?? Security

Semua endpoint dilindungi oleh:
- `JwtAuthGuard` - Authentication via JWT
- `TenantGuard` - Multi-tenant data isolation

## ??? Database Schema

### user_preferences
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `tenant_id` (varchar)
- `theme` (enum: light/dark)
- `language` (varchar)
- `timezone` (varchar)
- `notifications_email` (boolean)
- `notifications_push` (boolean)
- `notifications_sms` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### user_metadata
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `tenant_id` (varchar)
- `key` (varchar, 100)
- `value` (jsonb)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## ?? Usage Example

```typescript
// Update profile
PATCH /users/me
{
  "name": "John Doe",
  "bio": "Software Developer",
  "timezone": "America/New_York"
}

// Update preferences
PATCH /users/me/preferences
{
  "theme": "dark",
  "language": "en",
  "notifications_email": true
}

// Set metadata
POST /users/me/metadata
{
  "key": "favorite_color",
  "value": "blue"
}
```

## ?? Dependencies

- **Auth Module** - User authentication & authorization
- **TypeORM** - Database ORM
- **NestJS** - Framework

## ?? Progress

**Phase 1: Database & Migration** ? COMPLETE
- Database tables created
- Migrations executed successfully

**Phase 2: Entity & Repository** ? COMPLETE
- All entities created
- All repositories implemented with multi-tenant support

**Phase 3: Service Layer** ? COMPLETE
- All business logic implemented
- Error handling & validation

**Phase 4: Controller & DTO** ? COMPLETE
- REST API endpoints
- Swagger documentation
- Input validation

**Phase 5: Module Registration** ? COMPLETE
- UsersModule created
- Registered in AppModule

## ?? Next Steps

- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Add password change functionality
- [ ] Add user avatar upload
- [ ] Add email verification flow
- [ ] Add two-factor authentication support

## ?? License

Proprietary - Mixer Marketing Automation Platform
