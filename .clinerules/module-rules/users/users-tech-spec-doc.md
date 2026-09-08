Based on my analysis of the existing Auth and Settings modules, here's the **Technical Specification Document for Users Module**:

---

# 📋 **Users Module - Technical Specification Document**

## **1. Overview**

### **1.1 Purpose**
Users Module adalah modul inti untuk mengelola profile dan data lengkap pengguna yang terintegrasi dengan Auth Module. Modul ini menyediakan manajemen user profile, preferences, dan metadata yang dibutuhkan oleh semua module bisnis.

### **1.2 Scope**
- User profile management (CRUD)
- User preferences & settings
- User metadata (custom fields)
- User status management
- User search & filtering
- Integration dengan Auth Module

### **1.3 Version**
- **Version**: 0.3.0
- **Estimated Timeline**: 2-3 working days
- **Priority**: High (Core Infrastructure)

---

## **2. Features**

### **2.1 Core Features**
1. ✅ User profile management (name, avatar, bio, phone, address)
2. ✅ User preferences (theme, language, timezone, notifications)
3. ✅ User metadata (custom fields, extensible)
4. ✅ User status management (active, inactive, suspended)
5. ✅ User search & filtering (by name, email, role, status, date range)
6. ✅ Bulk user operations (activate, deactivate, delete)
7. ✅ User activity tracking (last login, profile updates)
8. ✅ Avatar/Profile picture upload support

### **2.2 Advanced Features**
1. User tags/labels (untuk segmentasi)
2. User notes (internal notes untuk admin)
3. User verification status (email, phone)
4. User import/export (CSV)
5. User activity log integration

---

## **3. Database Schema**

### **3.1 Users Table (Extended from Auth)**

```sql
-- Extends existing 'users' table from Auth Module
-- Base fields already exist: id, email, password, name, role, emailVerified, etc.

-- ADD NEW COLUMNS to users table:
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'light';
ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_users_tenant_status ON users(tenant_id, status);
```

### **3.2 User Preferences Table**

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255) NOT NULL,
  
  -- Preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  
  -- UI Preferences
  dashboard_layout JSONB DEFAULT '{}',
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  
  -- Communication preferences
  preferred_language VARCHAR(10) DEFAULT 'en',
  preferred_timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Privacy settings
  profile_public BOOLEAN DEFAULT FALSE,
  show_email BOOLEAN DEFAULT FALSE,
  show_phone BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_tenant_id ON user_preferences(tenant_id);
```

### **3.3 User Metadata Table (Key-Value Store)**

```sql
CREATE TABLE user_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255) NOT NULL,
  
  key VARCHAR(100) NOT NULL,
  value JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, key)
);

CREATE INDEX idx_user_metadata_user_id ON user_metadata(user_id);
CREATE INDEX idx_user_metadata_tenant_id ON user_metadata(tenant_id);
CREATE INDEX idx_user_metadata_key ON user_metadata(key);
```

### **3.4 User Notes Table (Internal Notes)**

```sql
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255) NOT NULL,
  
  note TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX idx_user_notes_tenant_id ON user_notes(tenant_id);
CREATE INDEX idx_user_notes_created_by ON user_notes(created_by);
```

---

## **4. API Endpoints**

### **4.1 User Profile Management**

```
GET    /users/me                           # Get current user profile
PATCH  /users/me                           # Update current user profile
PATCH  /users/me/password                  # Change password
PATCH  /users/me/preferences               # Update preferences
GET    /users/me/preferences                # Get preferences
POST   /users/me/avatar                     # Upload avatar
DELETE /users/me/avatar                     # Delete avatar

GET    /users                               # List all users (Admin/Manager)
GET    /users/:id                           # Get user by ID (Admin/Manager)
PATCH  /users/:id/status                    # Update user status (Admin only)
DELETE /users/:id                           # Soft delete user (Admin only)

POST   /users/bulk/activate                 # Bulk activate users (Admin)
POST   /users/bulk/deactivate               # Bulk deactivate users (Admin)
POST   /users/bulk/delete                   # Bulk delete users (Admin)
POST   /users/import                        # Import users from CSV (Admin)
GET    /users/export                        # Export users to CSV (Admin)
```

### **4.2 User Metadata & Notes**

```
GET    /users/:id/metadata                  # Get user metadata
POST   /users/:id/metadata                  # Add/update metadata
DELETE /users/:id/metadata/:key             # Delete metadata

GET    /users/:id/notes                     # Get user notes
POST   /users/:id/notes                     # Add note
DELETE /users/:id/notes/:noteId             # Delete note
```

### **4.3 Search & Filter**

```
GET    /users/search                         # Search users
  Query params:
  - q: search query (name, email)
  - role: filter by role
  - status: filter by status
  - email_verified: filter by verification status
  - created_after: filter by creation date
  - created_before: filter by creation date
  - page: page number
  - limit: items per page
  - sort: sort field
  - order: asc/desc
```

---

## **5. Module Structure**

```
users/
├── dto/
│   ├── create-user.dto.ts
│   ├── update-profile.dto.ts
│   ├── update-user-status.dto.ts
│   ├── change-password.dto.ts
│   ├── user-query.dto.ts
│   ├── user-response.dto.ts
│   └── bulk-action.dto.ts
├── entities/
│   ├── user.entity.ts (extend from auth)
│   ├── user-preferences.entity.ts
│   ├── user-metadata.entity.ts
│   └── user-note.entity.ts
├── interfaces/
│   ├── user.repository.interface.ts
│   ├── user-preferences.repository.interface.ts
│   └── user-metadata.repository.interface.ts
├── repositories/
│   ├── user.repository.ts
│   ├── user-preferences.repository.ts
│   └── user-metadata.repository.ts
├── services/
│   ├── users.service.ts
│   ├── user-preferences.service.ts
│   ├── user-metadata.service.ts
│   └── user-search.service.ts
├── controllers/
│   ├── users.controller.ts
│   └── user-search.controller.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── user-params.decorator.ts
├── guards/
│   └── user-ownership.guard.ts
├── interfaces/
│   ├── user.interface.ts
│   └── user-preferences.interface.ts
├── users.module.ts
└── index.ts
```

---

## **6. Dependencies**

### **6.1 Internal Dependencies**
- ✅ **Auth Module**: User entity, authentication, authorization
- ✅ **Settings Module**: Configuration (avatar upload limits, etc.)
- ⚠️ **Files Module**: For avatar upload (future - can use Settings config first)

### **6.2 External Dependencies**
- `class-validator`: DTO validation
- `class-transformer`: Data transformation
- `multer`: File upload (for avatar)
- `csv-parser` & `csv-writer`: Import/export

---

## **7. Security Considerations**

### **7.1 Access Control**
- **GET /users/me**: Authenticated users (own profile)
- **PATCH /users/me**: Authenticated users (own profile)
- **GET /users**: Admin, Manager
- **PATCH /users/:id/status**: Admin only
- **DELETE /users/:id**: Admin only
- **Bulk operations**: Admin only
- **Import/Export**: Admin only

### **7.2 Data Protection**
- Passwords: Never returned in API responses (already handled by Auth)
- Email/Phone: Respect privacy settings
- Metadata: Tenant-isolated
- Avatar: Validate file type & size
- PII data: Optional encryption for sensitive fields

### **7.3 Validation**
- Email format validation
- Phone number format validation
- Password strength validation (use Settings config)
- File upload validation (type, size)
- Input sanitization

---

## **8. Implementation Plan**

### **Phase 1: Core Entity & Repository** (Day 1 - 4 hours)
1. Extend User entity from Auth
2. Create new entities (Preferences, Metadata, Notes)
3. Create repository interfaces & implementations
4. Create database migration

### **Phase 2: Service Layer** (Day 1-2 - 6 hours)
1. UsersService (profile CRUD, status management)
2. UserPreferencesService (get/update preferences)
3. UserMetadataService (key-value metadata)
4. UserSearchService (search, filter, pagination)

### **Phase 3: Controller & DTO** (Day 2 - 4 hours)
1. Create all DTOs with validation
2. Create UsersController
3. Create UserSearchController
4. Add Swagger documentation

### **Phase 4: Guards & Decorators** (Day 2 - 2 hours)
1. CurrentUser decorator
2. UserOwnership guard
3. Role-based access

### **Phase 5: Testing** (Day 3 - 4 hours)
1. Unit tests for services
2. Integration tests for controllers
3. E2E tests for critical flows

### **Phase 6: Documentation** (Day 3 - 2 hours)
1. API documentation
2. Module README
3. Usage examples

---

## **9. Testing Strategy**

### **9.1 Unit Tests**
- Service methods (mocked repositories)
- DTO validation
- Helper functions

### **9.2 Integration Tests**
- Controller endpoints
- Repository queries
- Transaction handling

### **9.3 E2E Tests**
- User profile update flow
- Password change flow
- Search & filter flow
- Bulk operations
- Import/export flow

---

## **10. Performance Considerations**

### **10.1 Database Optimization**
- Indexes on frequently queried fields (email, role, status)
- Pagination for list endpoints (default 20, max 100)
- Selective field loading (avoid SELECT *)

### **10.2 Caching Strategy**
- Cache user preferences (Redis)
- Cache user profile (short TTL: 5 minutes)
- Invalidate cache on update

### **10.3 Query Optimization**
- Use TypeORM query builder for complex searches
- Full-text search for user search (PostgreSQL tsvector)
- Avoid N+1 queries with proper joins

---

## **11. Integration Points**

### **11.1 Auth Module**
- Extends User entity
- Uses existing JWT authentication
- Inherits role-based access

### **11.2 Settings Module**
- Reads configuration (avatar size limits, etc.)
- Uses tenant isolation pattern

### **11.3 Future Modules**
- **Notifications**: User notification preferences
- **Campaigns**: User as campaign recipient
- **Analytics**: User activity tracking
- **Files**: Avatar upload

---

## **12. Migration Strategy**

### **12.1 Database Migration**
```typescript
// Migration: add-user-profile-fields
// Adds new columns to users table
// Creates new tables: user_preferences, user_metadata, user_notes
```

### **12.2 Data Migration**
- Migrate existing users (backfill default preferences)
- No data loss (all fields nullable with defaults)

### **12.3 Rollback Plan**
- Migration is reversible
- Can drop new tables/columns if needed

---

## **13. Success Criteria**

- ✅ All CRUD operations working
- ✅ Multi-tenant isolation maintained
- ✅ Role-based access control enforced
- ✅ Search & filter functional
- ✅ Import/export working
- ✅ Tests passing (unit, integration, e2e)
- ✅ API documentation complete
- ✅ Performance < 200ms for list queries
- ✅ Cache hit rate > 80% for profile reads

---

## **14. Risks & Mitigations**

| Risk | Impact | Mitigation |
|------|--------|------------|
| User entity conflicts with Auth | High | Extend carefully, maintain backward compatibility |
| Large dataset performance | Medium | Implement pagination, indexing, caching |
| File upload complexity | Low | Start without avatar, add later if needed |
| Search performance | Medium | Use full-text search, limit result set |

---

## **15. Next Steps** (After Approval)

1. Create database migration
2. Implement entities & repositories
3. Implement service layer
4. Implement controllers & DTOs
5. Add guards & decorators
6. Write tests
7. Update API documentation
8. Deploy to staging
9. User acceptance testing

---

## **Summary**

**Users Module** adalah modul core yang esencial untuk platform. Modul ini:
- ✅ Melengkapi Auth Module dengan profile management
- ✅ Menyediakan infrastructure untuk module bisnis
- ✅ Support multi-tenant & RBAC
- ✅ Search, filter, import/export capabilities
- ✅ Extensible metadata system
- ✅ Estimated 2-3 days implementation

**Ready to proceed with implementation?** 🚀