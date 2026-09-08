# Users Module - Technical Specification Document
## Enterprise-Grade User Management System

**Project**: Mixer - Enterprise Marketing Automation Platform
**Module**: Users Module (Core Infrastructure)
**Document Type**: Technical Specification (Spec)
**Version**: 1.0
**Date**: 2026-09-08
**Owner**: Tech Lead & Engineering Team
**Status**: Draft for Review
**Depends On**: Auth Module (v0.1.0), Settings Module (v0.2.0)
---

## ?? TABLE OF CONTENTS

1. [System Architecture](#system-architecture)
2. [Data Model & Database Schema](#data-model--database-schema)
3. [API Specification](#api-specification)
4. [Security & Authorization](#security--authorization)
5. [Caching Strategy](#caching-strategy)
6. [Integration Points](#integration-points)
7. [Error Handling](#error-handling)
8. [Performance Requirements](#performance-requirements)
9. [Testing Strategy](#testing-strategy)
10. [Monitoring & Observability](#monitoring--observability)
11. [Implementation Plan](#implementation-plan)
12. [References](#references)
---

## ??? SYSTEM ARCHITECTURE

### **High-Level Architecture**

```
+-------------------------------------------------------------+
�                    Mixer Platform                            �
+-------------------------------------------------------------�
�                                                             �
�  +------------------------------------------------------+  �
�  �          API Gateway / Load Balancer                  �  �
�  �  - Authentication (JWT)                               �  �
�  �  - Rate Limiting                                      �  �
�  �  - Request Routing                                    �  �
�  +------------------------------------------------------+  �
�                       �                                     �
�  +--------------------?---------------------------------+  �
�  �              Users Module (NestJS)                    �  �
�  �  +------------------------------------------------+  �  �
�  �  �  Users Controller                               �  �  �
�  �  �  - REST API endpoints                          �  �  �
�  �  �  - Input validation                            �  �  �
�  �  �  - Authorization checks                         �  �  �
�  �  �  - Search & filter                             �  �  �
�  �  +------------------------------------------------+  �  �
�  �                   �                                   �  �
�  �  +----------------?-------------------------------+  �  �
�  �  �  Users Service                                 �  �  �
�  �  �  - Business logic                              �  �  �
�  �  �  - Profile management                          �  �  �
�  �  �  - Search & filtering                          �  �  �
�  �  �  - Bulk operations                             �  �  �
�  �  �  - Import/Export                               �  �  �
�  �  +------------------------------------------------+  �  �
�  �                   �                                   �  �
�  �  +----------------?-------------------------------+  �  �
�  �  �  Users Repository                              �  �  �
�  �  �  - Data access layer                           �  �  �
�  �  �  - Query optimization                          �  �  �
�  �  �  - Full-text search                            �  �  �
�  �  �  - Multi-tenant isolation                      �  �  �
�  �  +------------------------------------------------+  �  �
�  +------------------------------------------------------+  �
�                       �                                     �
+-----------------------+-------------------------------------�
�                       �                                     �
�  +--------------------?---------------------------------+  �
�  �              Auth Module                              �  �
�  �  - JWT Authentication                                 �  �
�  �  - User Entity (base)                                 �  �
�  �  - RBAC                                               �  �
�  +------------------------------------------------------+  �
�                                                             �
�  +------------------------------------------------------+  �
�  �            Settings Module                            �  �
�  �  - Configuration (upload limits, etc.)                �  �
�  +------------------------------------------------------+  �
�                                                             �
�  +------------------------------------------------------+  �
�  �            PostgreSQL                                 �  �
�  �  - users (extended)                                   �  �
�  �  - user_preferences                                   �  �
�  �  - user_metadata                                      �  �
�  +------------------------------------------------------+  �
�                                                             �
�  +------------------------------------------------------+  �
�  �            Redis Cache                                �  �
�  �  - User profiles                                      �  �
�  �  - Preferences                                       �  �
�  +------------------------------------------------------+  �
+-------------------------------------------------------------+
```

### **Module Dependencies**

```
Users Module
    +--> Auth Module (User entity, JWT, RBAC)
    +--> Settings Module (Configuration)
    +--> PostgreSQL (Primary database)
    +--> Redis (Cache - optional)
```

**Dependency Matrix**:

| Module | Dependency Type | Purpose |
|--------|----------------|---------|
| **Auth Module** | Required | User entity, authentication, authorization |
| **Settings Module** | Optional | Configuration (upload limits, etc.) |
| **Redis** | Optional | Caching (performance optimization) |
| **PostgreSQL** | Required | Persistent storage |
---

### **Component Architecture**

```
Users Module Components:

1. UsersController
   - HTTP endpoint handlers
   - Request/response mapping
   - Input validation (class-validator)
   - Authorization checks (RBAC)
   - Search & filter parameters

2. UsersService
   - Business logic orchestration
   - Profile CRUD operations
   - User search & filtering
   - Bulk operations
   - Import/Export logic

3. UsersRepository
   - Data access layer
   - Query optimization
   - Full-text search
   - Multi-tenant isolation
   - Pagination support

4. UserPreferencesService
   - User preferences management
   - Default preferences initialization

5. UserMetadataService
   - Key-value metadata management
   - Extensible custom fields

6. CacheService (Shared)
   - User profile caching
   - Preferences caching
   - Cache invalidation
```
---

## ?? DATA MODEL & DATABASE SCHEMA

### **Entity Relationship Diagram**

```
+-------------------------------------------------------------+
�                      Database Schema                         �
+-------------------------------------------------------------�
�                                                             �
�  +------------------------------------------------------+  �
�  �                    users                             �  �
�  +------------------------------------------------------�  �
�  � id (PK)             UUID                             �  �
�  � email               VARCHAR(255)                     �  �
�  � password            VARCHAR(255)                     �  �
�  � name                VARCHAR(255)                     �  �
�  � role                VARCHAR(50)                      �  �
�  � avatar_url          VARCHAR(500) ? NEW               �  �
�  � bio                 TEXT ? NEW                       �  �
�  � phone               VARCHAR(20) ? NEW               �  �
�  � phone_verified      BOOLEAN ? NEW                   �  �
�  � date_of_birth       DATE ? NEW                       �  �
�  � gender              VARCHAR(20) ? NEW               �  �
�  � address             JSONB ? NEW                      �  �
�  � city                VARCHAR(100) ? NEW              �  �
�  � country             VARCHAR(100) ? NEW              �  �
�  � timezone            VARCHAR(50) ? NEW               �  �
�  � language            VARCHAR(10) ? NEW               �  �
�  � theme               VARCHAR(20) ? NEW               �  �
�  � metadata            JSONB ? NEW                      �  �
�  � status              VARCHAR(20) ? NEW               �  �
�  � ... (other Auth fields)                              �  �
�  � created_at, updated_at, deleted_at                  �  �
�  +------------------------------------------------------+  �
�                       � 1:N                                 �
�                       �                                     �
�  +------------------------------------------------------+  �
�  �              user_preferences                         �  �
�  +------------------------------------------------------�  �
�  � id (PK)              UUID                             �  �
�  � user_id (FK)         UUID ? users.id                 �  �
�  � tenant_id            VARCHAR(255)                    �  �
�  � email_notifications  BOOLEAN                         �  �
�  � sms_notifications    BOOLEAN                         �  �
�  � push_notifications   BOOLEAN                         �  �
�  � marketing_emails     BOOLEAN                         �  �
�  � dashboard_layout     JSONB                            �  �
�  � sidebar_collapsed    BOOLEAN                         �  �
�  � preferred_language   VARCHAR(10)                     �  �
�  � preferred_timezone   VARCHAR(50)                     �  �
�  � profile_public       BOOLEAN                         �  �
�  � show_email           BOOLEAN                         �  �
�  � show_phone           BOOLEAN                         �  �
�  � created_at, updated_at                               �  �
�  +------------------------------------------------------+  �
�                                                             �
�  +------------------------------------------------------+  �
�  �               user_metadata                           �  �
�  +------------------------------------------------------�  �
�  � id (PK)              UUID                             �  �
�  � user_id (FK)         UUID ? users.id                 �  �
�  � tenant_id            VARCHAR(255)                    �  �
�  � key                  VARCHAR(100)                    �  �
�  � value                JSONB                            �  �
�  � created_at, updated_at                               �  �
�  +------------------------------------------------------+  �
+-------------------------------------------------------------+
```

### **Database Migration**

```typescript
// migration: 20260908000000-add-user-profile-fields
import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from 'typeorm';

export class AddUserProfileFields20260908000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to users table
    const columns = [
      { name: 'avatar_url', type: 'varchar', length: '500', isNullable: true },
      { name: 'bio', type: 'text', isNullable: true },
      { name: 'phone', type: 'varchar', length: '20', isNullable: true },
      { name: 'phone_verified', type: 'boolean', default: false },
      { name: 'date_of_birth', type: 'date', isNullable: true },
      { name: 'gender', type: 'varchar', length: '20', isNullable: true },
      { name: 'address', type: 'jsonb', isNullable: true },
      { name: 'city', type: 'varchar', length: '100', isNullable: true },
      { name: 'country', type: 'varchar', length: '100', isNullable: true },
      { name: 'timezone', type: 'varchar', length: '50', default: "'UTC'" },
      { name: 'language', type: 'varchar', length: '10', default: "'en'" },
      { name: 'theme', type: 'varchar', length: '20', default: "'light'" },
      { name: 'metadata', type: 'jsonb', default: "'{}'" },
      { name: 'status', type: 'varchar', length: '20', default: "'active'" },
    ];

    for (const col of columns) {
      await queryRunner.addColumn('users', new TableColumn({
        name: col.name,
        type: col.type,
        length: col.length,
        isNullable: col.isNullable,
        default: col.default,
      }));
    }

    // Create indexes
    await queryRunner.createIndex('users', new TableIndex({
      name: 'idx_users_status',
      columnNames: ['status'],
    }));

    await queryRunner.createIndex('users', new TableIndex({
      name: 'idx_users_role',
      columnNames: ['role'],
    }));

    await queryRunner.createIndex('users', new TableIndex({
      name: 'idx_users_tenant_role',
      columnNames: ['tenant_id', 'role'],
    }));

    await queryRunner.createIndex('users', new TableIndex({
      name: 'idx_users_tenant_status',
      columnNames: ['tenant_id', 'status'],
    }));

    // Create user_preferences table
    await queryRunner.createTable(
      new Table({
        name: 'user_preferences',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'tenant_id', type: 'varchar', length: '255', isNullable: false },
          { name: 'email_notifications', type: 'boolean', default: true },
          { name: 'sms_notifications', type: 'boolean', default: false },
          { name: 'push_notifications', type: 'boolean', default: true },
          { name: 'marketing_emails', type: 'boolean', default: false },
          { name: 'dashboard_layout', type: 'jsonb', default: "'{}'" },
          { name: 'sidebar_collapsed', type: 'boolean', default: false },
          { name: 'preferred_language', type: 'varchar', length: '10', default: "'en'" },
          { name: 'preferred_timezone', type: 'varchar', length: '50', default: "'UTC'" },
          { name: 'profile_public', type: 'boolean', default: false },
          { name: 'show_email', type: 'boolean', default: false },
          { name: 'show_phone', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
        ],
        uniques: [{ columnNames: ['user_id'] }],
      }),
      true,
    );

    // Create user_metadata table
    await queryRunner.createTable(
      new Table({
        name: 'user_metadata',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'tenant_id', type: 'varchar', length: '255', isNullable: false },
          { name: 'key', type: 'varchar', length: '100', isNullable: false },
          { name: 'value', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
        ],
        uniques: [{ columnNames: ['user_id', 'key'] }],
      }),
      true,
    );

    // Create indexes for metadata
    await queryRunner.createIndex('user_metadata', new TableIndex({
      name: 'idx_user_metadata_tenant_id',
      columnNames: ['tenant_id'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('users', 'idx_users_tenant_status');
    await queryRunner.dropIndex('users', 'idx_users_tenant_role');
    await queryRunner.dropIndex('users', 'idx_users_role');
    await queryRunner.dropIndex('users', 'idx_users_status');
    await queryRunner.dropIndex('user_metadata', 'idx_user_metadata_tenant_id');

    // Drop tables
    await queryRunner.dropTable('user_metadata');
    await queryRunner.dropTable('user_preferences');

    // Remove columns from users
    const columnsToRemove = [
      'avatar_url', 'bio', 'phone', 'phone_verified',
      'date_of_birth', 'gender', 'address', 'city', 'country',
      'timezone', 'language', 'theme', 'metadata', 'status'
    ];

    for (const col of columnsToRemove) {
      await queryRunner.dropColumn('users', col);
    }
  }
}
```
---

## ?? API SPECIFICATION

### **Base URL**
```
/api/v1/users
```

### **Authentication**
All endpoints require JWT authentication via `Authorization: Bearer <token>`

### **Authorization**
- **User role**: Can access `/me` endpoints (own profile)
- **Admin, Manager role**: Can access all user management endpoints
- **Admin only**: Can update status, delete users, bulk operations

---

### **User Profile Endpoints**

#### **GET /users/me**
Get current authenticated user's profile

**Response 200**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://...",
  "bio": "Software Engineer",
  "phone": "+1234567890",
  "phone_verified": true,
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "address": {
    "street": "123 Main St",
    "city": "Jakarta",
    "country": "Indonesia"
  },
  "timezone": "Asia/Jakarta",
  "language": "en",
  "theme": "light",
  "status": "active",
  "email_verified": true,
  "role": "user",
  "last_login": "2026-09-08T10:00:00Z",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-09-08T10:00:00Z"
}
```

---

#### **PATCH /users/me**
Update current user's profile

**Request Body**:
```json
{
  "name": "John Doe",
  "bio": "Senior Developer",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "address": {
    "street": "123 Main St",
    "city": "Jakarta"
  },
  "timezone": "Asia/Jakarta",
  "language": "en",
  "theme": "dark"
}
```

**Response 200**: Updated user object

---

#### **PATCH /users/me/password**
Change current user's password

**Request Body**:
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass456!",
  "confirm_password": "NewPass456!"
}
```

**Response 204**: No content

---

#### **GET /users/me/preferences**
Get current user's preferences

**Response 200**:
```json
{
  "email_notifications": true,
  "sms_notifications": false,
  "push_notifications": true,
  "marketing_emails": false,
  "dashboard_layout": {},
  "sidebar_collapsed": false,
  "preferred_language": "en",
  "preferred_timezone": "UTC",
  "profile_public": false,
  "show_email": false,
  "show_phone": false
}
```

---

#### **PATCH /users/me/preferences**
Update current user's preferences

**Request Body**:
```json
{
  "email_notifications": false,
  "push_notifications": true,
  "theme": "dark"
}
```

**Response 200**: Updated preferences object

---

#### **GET /users/me/metadata**
Get current user's custom metadata

**Response 200**:
```json
{
  "company": "Acme Corp",
  "department": "Engineering",
  "employee_id": "EMP001"
}
```

---

#### **POST /users/me/metadata**
Add or update metadata key

**Request Body**:
```json
{
  "key": "company",
  "value": "Acme Corp"
}
```

**Response 201**: Created metadata object

---

#### **DELETE /users/me/metadata/:key**
Delete metadata key

**Response 204**: No content

---

### **User Management Endpoints** (Admin/Manager)

#### **GET /users**
List all users with pagination and filters

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string): Search by name or email
- `role` (string): Filter by role (admin, manager, user)
- `status` (string): Filter by status (active, inactive, suspended)
- `email_verified` (boolean): Filter by verification status
- `created_after` (ISO date): Filter by creation date
- `created_before` (ISO date): Filter by creation date
- `sort` (string): Sort field (name, email, created_at)
- `order` (string): Sort order (asc, desc)

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "status": "active",
      "email_verified": true,
      "last_login": "2026-09-08T10:00:00Z",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

#### **GET /users/:id**
Get user by ID

**Response 200**: User object (same as GET /users/me)
**Response 404**: User not found

---

#### **PATCH /users/:id/status**
Update user status (Admin only)

**Request Body**:
```json
{
  "status": "suspended",
  "reason": "Violation of terms of service"
}
```

**Status Values**: `active`, `inactive`, `suspended`

**Response 200**: Updated user object
**Response 403**: Forbidden (Admin only)
**Response 404**: User not found

---

#### **DELETE /users/:id**
Soft delete user (Admin only)

**Response 204**: No content
**Response 403**: Forbidden (Admin only)
**Response 404**: User not found

---

#### **POST /users/bulk/activate**
Bulk activate users (Admin only)

**Request Body**:
```json
{
  "user_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response 200**:
```json
{
  "success": true,
  "activated_count": 3,
  "failed": []
}
```
---

#### **POST /users/bulk/deactivate**
Bulk deactivate users (Admin only)

**Request Body**:
```json
{
  "user_ids": ["uuid1", "uuid2"]
}
```

**Response 200**:
```json
{
  "success": true,
  "deactivated_count": 2,
  "failed": []
}
```
---

#### **POST /users/import**
Import users from CSV (Admin only)

**Request**: Multipart form data with CSV file

**CSV Format**:
```csv
email,name,role,timezone,language
user1@example.com,User One,user,UTC,en
user2@example.com,User Two,manager,Asia/Jakarta,id
```

**Response 201**:
```json
{
  "success": true,
  "imported": 10,
  "failed": 2,
  "errors": [
    { "row": 3, "error": "Invalid email format" }
  ]
}
```
---

#### **GET /users/export**
Export users to CSV (Admin only)

**Query Parameters**:
- `role` (optional): Filter by role
- `status` (optional): Filter by status
- `created_after` (optional): Filter by date
- `created_before` (optional): Filter by date

**Response**: CSV file download
---

### **Search Endpoint**

#### **GET /users/search**
Search users with full-text search

**Query Parameters**:
- `q` (string, required): Search query
- `page`, `limit`, `sort`, `order`: Pagination
- `role`, `status`: Filters

**Response 200**: Same as GET /users
---

## ?? SECURITY & AUTHORIZATION

### **Access Control Matrix**

| Endpoint | Admin | Manager | User |
|----------|-------|---------|------|
| GET /users/me | ? | ? | ? |
| PATCH /users/me | ? | ? | ? (own) |
| PATCH /users/me/password | ? | ? | ? (own) |
| GET /users | ? | ? | ? |
| GET /users/:id | ? | ? | ? |
| PATCH /users/:id/status | ? | ? | ? |
| DELETE /users/:id | ? | ? | ? |
| POST /users/bulk/* | ? | ? | ? |
| POST /users/import | ? | ? | ? |
| GET /users/export | ? | ? | ? |

---

### **Security Measures**

1. **Authentication**: JWT token validation via Auth Module
2. **Authorization**: Role-based access control (RBAC)
3. **Multi-tenancy**: All queries filtered by `tenant_id`
4. **Data Validation**: Input sanitization via class-validator
5. **Password Security**: Bcrypt hashing (handled by Auth Module)
6. **PII Protection**:
   - Email/phone masked based on user privacy settings
   - Sensitive fields encrypted at rest (future)
7. **Rate Limiting**: Prevent brute-force attacks
8. **Audit Logging**: All mutations logged (future integration with Audit Logs Module)

---

### **Password Change Flow**

```typescript
// 1. Validate current password
const user = await this.authService.validatePassword(userId, currentPassword);

// 2. Check password history (prevent reuse)
const lastPasswords = await this.passwordHistoryService.getRecent(userId, 5);
if (lastPasswords.some(p => bcrypt.compare(newPassword, p.hash))) {
  throw new BadRequestException('Password was used recently');
}

// 3. Hash new password
const hashedPassword = await bcrypt.hash(newPassword, 10);

// 4. Update password
await this.userRepository.update(userId, { password: hashedPassword });

// 5. Save to password history
await this.passwordHistoryService.create(userId, hashedPassword);

// 6. Invalidate all sessions (force re-login)
await this.sessionService.invalidateAllUserSessions(userId);
```
---

### **Data Privacy**

```typescript
// Privacy-aware response transformation
function transformUserForResponse(user: User, requester: User): Partial<User> {
  const isOwnProfile = user.id === requester.id;
  const isAdmin = [UserRole.ADMIN, UserRole.MANAGER].includes(requester.role);

  return {
    id: user.id,
    email: isOwnProfile || isAdmin || user.profilePublic ? user.email : maskEmail(user.email),
    phone: isOwnProfile || isAdmin || user.showPhone ? user.phone : maskPhone(user.phone),
    // ... other fields
  };
}
```
---

## ??? CACHING STRATEGY

### **Cache Keys**

| Cache Key Pattern | TTL | Invalidation |
|-------------------|-----|--------------|
| `user:profile:{userId}` | 5 minutes | On profile update |
| `user:preferences:{userId}` | 10 minutes | On preferences update |
| `user:search:{queryHash}` | 1 minute | On user create/update/delete |
| `users:list:{filtersHash}` | 2 minutes | On user create/update/delete |

---

### **Cache Implementation**

```typescript
@Injectable()
export class UserCacheService {
  constructor(@Inject('REDIS') private redis: Redis) {}

  async getUserProfile(userId: string): Promise<User | null> {
    const key = `user:profile:${userId}`;
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);
    return null;
  }

  async setUserProfile(userId: string, user: User, ttl = 300): Promise<void> {
    const key = `user:profile:${userId}`;
    await this.redis.setex(key, ttl, JSON.stringify(user));
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const keys = [
      `user:profile:${userId}`,
      `user:preferences:${userId}`,
    ];
    await this.redis.del(keys);
    // Invalidate list/search caches
    await this.redis.delPattern('users:list:*');
    await this.redis.delPattern('user:search:*');
  }
}
```
---

## ?? INTEGRATION POINTS

### **Auth Module Integration**

```typescript
// Extend Auth User entity
@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'role' } })
export class User extends AuthUser {
  // Additional profile fields
  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  phone: string;

  // ... other fields

  // Relations
  @OneToOne(() => UserPreferences, pref => pref.user)
  preferences: UserPreferences;

  @OneToMany(() => UserMetadata, meta => meta.user)
  metadata: UserMetadata[];
}
```
---

### **Settings Module Integration**

```typescript
// Read settings for user module configuration
const uploadLimits = await this.settingsService.getByKey(
  tenantId,
  SettingCategory.FILES,
  'user_avatar_max_size'
);

const allowedDomains = await this.settingsService.getByKey(
  tenantId,
  SettingCategory.SECURITY,
  'allowed_email_domains'
);
```
---

### **Future Module Integrations**

```
Users Module (Future Integrations)
    +--> Notifications Module: User notification preferences
    +--> Campaigns Module: User as campaign recipient
    +--> Analytics Module: User activity tracking
    +--> Files Module: Avatar upload
    +--> Audit Logs Module: User action logging
```
---

## ?? ERROR HANDLING

### **Error Codes & Messages**

```typescript
export enum UsersErrorCodes {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_INVALID_STATUS = 'USER_INVALID_STATUS',
  USER_PREFERENCE_NOT_FOUND = 'USER_PREFERENCE_NOT_FOUND',
  USER_METADATA_NOT_FOUND = 'USER_METADATA_NOT_FOUND',
  USER_PASSWORD_MISMATCH = 'USER_PASSWORD_MISMATCH',
  USER_PASSWORD_REUSED = 'USER_PASSWORD_REUSED',
  USER_AVATAR_INVALID_TYPE = 'USER_AVATAR_INVALID_TYPE',
  USER_AVATAR_TOO_LARGE = 'USER_AVATAR_TOO_LARGE',
  USER_IMPORT_FAILED = 'USER_IMPORT_FAILED',
  USER_BULK_ACTION_FAILED = 'USER_BULK_ACTION_FAILED',
  USER_PERMISSION_DENIED = 'USER_PERMISSION_DENIED',
}

// Custom exceptions
export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundException';
  }
}

export class UserAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'UserAlreadyExistsException';
  }
}

export class UserPasswordMismatchException extends BadRequestException {
  constructor() {
    super('Current password is incorrect');
    this.name = 'UserPasswordMismatchException';
  }
}
```
---

### **Error Handling Middleware**

```typescript
// exceptions/users-exception.filter.ts
@Catch(UsersException)
export class UsersExceptionFilter implements ExceptionFilter {
  catch(exception: UsersException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const errorResponse = {
      error: {
        code: exception.name,
        message: exception.message,
        statusCode: exception.getStatus(),
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    response.status(exception.getStatus()).json(errorResponse);
  }
}
```
---

## ? PERFORMANCE REQUIREMENTS

### **Performance Targets**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time (p95)** | <100ms | GET /users/me |
| **API Response Time (p95)** | <200ms | GET /users (list) |
| **API Response Time (p95)** | <300ms | GET /users/search |
| **Database Query Time** | <30ms | Indexed queries |
| **Cache Hit Rate** | >80% | Profile & preferences |
| **Search Response Time** | <500ms | Full-text search |
| **Import Processing** | <5s | 1000 users CSV |
| **Export Generation** | <10s | 10,000 users |
| **Concurrent Requests** | 500 req/s | Load testing |

---

### **Performance Optimization**

```typescript
// 1. Database Indexing
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX idx_users_tenant_status ON users(tenant_id, status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

// 2. Full-Text Search (PostgreSQL)
CREATE INDEX idx_users_search ON users USING gin(
  to_tsvector('english', name || ' ' || email)
);

// 3. Query Optimization
const users = await this.userRepository
  .createQueryBuilder('user')
  .select(['user.id', 'user.email', 'user.name', 'user.role', 'user.status'])
  .where('user.tenantId = :tenantId', { tenantId })
  .andWhere('user.deletedAt IS NULL')
  .orderBy('user.createdAt', 'DESC')
  .skip((page - 1) * limit)
  .take(limit)
  .getMany();

// 4. Caching (Redis)
const CACHE_TTL = 300; // 5 minutes

// 5. Connection Pooling
// PostgreSQL max connections: 20
```
---

## ?? TESTING STRATEGY

### **Test Coverage Requirements**

| Test Type | Coverage Target | Priority |
|-----------|----------------|----------|
| **Unit Tests** | >90% | High |
| **Integration Tests** | >85% | High |
| **E2E Tests** | >70% | Medium |

---

### **Unit Tests**

```typescript
// __tests__/unit/users.service.spec.ts
describe('UsersService', () => {
  describe('updateProfile', () => {
    it('should update user profile', async () => {
      // Arrange
      const userId = 'user_123';
      const updateDto = { name: 'John Doe', bio: 'Developer' };

      // Act
      const result = await service.updateProfile(userId, updateDto);

      // Assert
      expect(result.name).toBe('John Doe');
      expect(result.bio).toBe('Developer');
    });
  });

  describe('searchUsers', () => {
    it('should return matching users', async () => {
      // Arrange
      const query = 'john';

      // Act
      const result = await service.searchUsers(query);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].email).toContain('john');
    });
  });
});
```
---

### **Integration Tests**

```typescript
// __tests__/integration/users.controller.spec.ts
describe('UsersController (e2e)', () => {
  it('/users/me (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBeDefined();
        expect(res.body.name).toBeDefined();
      });
  });

  it('/users/me (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ name: 'Updated Name' })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Updated Name');
      });
  });
});
```
---

### **E2E Tests**

```typescript
// test/users/users.e2e-spec.ts
describe('Users Module (e2e)', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let user: User;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  beforeEach(async () => {
    // Create test user
    user = await authService.register(registerDto);
  });

  it('should update profile', async () => {
    const updated = await usersService.updateProfile(user.id, {
      name: 'New Name',
      bio: 'Bio',
    });
    expect(updated.name).toBe('New Name');
  });
});
```
---

## ?? MONITORING & OBSERVABILITY

### **Metrics to Track**

```typescript
// metrics.service.ts
export class UsersMetrics {
  // Request metrics
  private readonly requestCounter = new Counter({
    name: 'users_requests_total',
    help: 'Total users API requests',
    labelNames: ['method', 'endpoint', 'status'],
  });

  // Response time
  private readonly requestDuration = new Histogram({
    name: 'users_request_duration_seconds',
    help: 'Users API request duration',
    labelNames: ['method', 'endpoint'],
    buckets: [0.05, 0.1, 0.2, 0.5, 1],
  });

  // Cache metrics
  private readonly cacheHits = new Counter({
    name: 'users_cache_hits_total',
    help: 'Cache hits',
  });

  private readonly cacheMisses = new Counter({
    name: 'users_cache_misses_total',
    help: 'Cache misses',
  });

  // User metrics
  private readonly userCreated = new Counter({
    name: 'users_created_total',
    help: 'Total users created',
  });

  private readonly userUpdated = new Counter({
    name: 'users_updated_total',
    help: 'Total users updated',
  });

  private readonly userDeleted = new Counter({
    name: 'users_deleted_total',
    help: 'Total users deleted',
  });
}
```
---

### **Logging**

```typescript
// Logging format (structured JSON)
{
  "timestamp": "2026-09-08T10:30:00.000Z",
  "level": "info",
  "service": "users-module",
  "tenantId": "tenant_123",
  "userId": "user_456",
  "action": "user.profile.updated",
  "changes": {
    "name": "John Doe",
    "bio": "Developer"
  },
  "duration": 45,
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```
---

## ?? IMPLEMENTATION PLAN

### **Sprint Breakdown**

```
Sprint 1 (Week 1):
  Day 1-2: Database schema & migration
  Day 3-4: Entity definition & Repository implementation
  Day 5: Service layer (profile CRUD)

Sprint 2 (Week 2):
  Day 1-2: Service layer (search, bulk ops, import/export)
  Day 3-4: Controller, DTOs, validation
  Day 5: Caching integration, unit tests

Total: 10 days (2 weeks)
```

---

### **Task Breakdown**

| Task | Owner | Estimate | Dependencies |
|------|-------|----------|--------------|
| Database migration | Backend | 1 day | None |
| Entity definition | Backend | 0.5 day | Database |
| Repository implementation | Backend | 1.5 days | Entity |
| Service layer | Backend | 3 days | Repository |
| Controller & DTOs | Backend | 1.5 days | Service |
| Cache integration | Backend | 0.5 day | Redis |
| Unit tests | QA | 1.5 days | Service |
| Integration tests | QA | 1.5 days | Controller |
| E2E tests | QA | 1 day | Full stack |
| Documentation | Tech Writer | 0.5 day | All |
| Code review | Tech Lead | 0.5 day | All |

**Total Estimate**: 12 days (2.5 weeks)
---

## ?? REFERENCES

### **Internal Documentation**
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Mixer Architecture Document](./docs/architecture/system-architecture.md)
- [Settings Module Spec](./docs/settings-module-spec.md)
- [Auth Module Spec](./docs/auth-module-spec.md)

### **External References**
- [REST API Design Best Practices](https://restfulapi.net/)
- [PostgreSQL JSONB Best Practices](https://www.postgresql.org/docs/current/datatype-json.html)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [CSV Import/Export Best Practices](https://tools.ietf.org/html/rfc4180)
---

## ? APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Tech Lead** | [Name] | _______________ | 2026-09-08 |
| **Backend Architect** | [Name] | _______________ | 2026-09-08 |
| **Security Engineer** | [Name] | _______________ | 2026-09-08 |
| **QA Lead** | [Name] | _______________ | 2026-09-08 |
| **DevOps Lead** | [Name] | _______________ | 2026-09-08 |
---

**This Technical Specification is ready for implementation. Next step: Development Sprint Planning.**

*Version: 1.0 | 2026-09-08 | Status: Draft for Review*
