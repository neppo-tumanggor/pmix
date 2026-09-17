# Product Module - Technical Design Document

**Project**: pmix - Enterprise Marketing System Platform  
**Module**: Product Management (Product Module)  
**Version**: 1.0.0  
**Date**: 2026-09-17  
**Status**: Draft  
**Author**: Mixer Development Team  

---

## Table of Contents

1. Architecture Overview
2. Module Structure
3. Database Design
4. API Design
5. Security Design
6. Implementation Details
7. Integration Points
8. Error Handling
9. Testing Strategy
10. Performance Optimization

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│           (Next.js Frontend / API Consumers)                │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS/REST
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway / Load Balancer             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    NestJS Application Layer                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Products Module                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │ Controllers  │  │  Services   │  │ Repositories │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │    DTOs     │  │  Entities   │  │    Guards    │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Auth Module (Shared)                       │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   SQLite     │  │ PostgreSQL   │  │   File Storage  │  │
│  │  (Dev)       │  │  (Prod)      │  │   (CSV Export)  │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles

- **Multi-Tenant Isolation**: Every operation is scoped to tenant
- **Repository Pattern**: Abstract data access behind interfaces
- **DTO Validation**: Validate all inputs at the boundary using class-validator
- **Soft Delete**: Preserve data with deleted_at timestamp
---

## 2. Module Structure

Products Module follows standard NestJS architecture with Controller-Service-Repository pattern.

Key components:
- Controller: Handles HTTP requests/responses
- Service: Contains business logic
- Repository: Data access layer using TypeORM
- DTOs: Input validation and type safety
- Entities: Database schema definitions

---

## 3. Database Design

### 3.1 Product Entity

Products table extends TenantEntity for multi-tenant support:
- id: UUID (Primary Key)
- tenant_id: VARCHAR(255) (Multi-tenant)
- name: VARCHAR(255) (Required)
- description: TEXT (Nullable)
- price: DECIMAL(10,2) (Required, min 0)
- category: VARCHAR(100) (Nullable)
- stock: INTEGER (Default 0, min 0)
- image_url: VARCHAR(500) (Nullable)
- is_active: BOOLEAN (Default true)
- created_at, updated_at, deleted_at: Audit timestamps

### 3.2 Product Category Entity

Product categories for organizing products:
- id: UUID (Primary Key)
- tenant_id: VARCHAR(255)
- name: VARCHAR(100) (Unique per tenant)
- parent_id: UUID (Nullable, for hierarchy)
- description: TEXT (Nullable)
- created_at, updated_at, deleted_at

### 3.3 Database Indexes

Performance indexes on frequently queried columns:
- idx_products_tenant_id ON products(tenant_id)
- idx_products_category ON products(category)
- idx_products_created_at ON products(created_at)
- idx_products_is_active ON products(is_active)
- idx_products_tenant_deleted ON products(tenant_id, deleted_at)
- idx_categories_tenant_id ON product_categories(tenant_id)
- idx_categories_parent_id ON product_categories(parent_id)

---

## 4. API Design

### 4.1 Product Endpoints

- POST /api/v1/products - Create product
- GET /api/v1/products - List products (paginated)
- GET /api/v1/products/:id - Get product by ID
- PATCH /api/v1/products/:id - Update product
- DELETE /api/v1/products/:id - Soft delete product
- POST /api/v1/products/:id/restore - Restore soft-deleted product
- POST /api/v1/products/bulk-import - Import products from CSV
- GET /api/v1/products/export - Export products to CSV

### 4.2 Category Endpoints

- GET /api/v1/products/categories - List all categories
- POST /api/v1/products/categories - Create new category
- PATCH /api/v1/products/categories/:id - Update category
- DELETE /api/v1/products/categories/:id - Delete category

### 4.3 Query Parameters (GET /products)

- page: number (default: 1)
- limit: number (default: 20, max: 100)
- sortBy: string (default: createdAt, allowed: name, price, stock, createdAt)
- sortOrder: string (default: desc, allowed: asc, desc)
- search: string (optional, search by name)
- category: string (optional, filter by category)
- isActive: boolean (optional)
- minPrice, maxPrice: number (optional)
- inStock: boolean (optional)

### 4.4 Response Format

Success:
```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

Error:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "PROD-001",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

Pagination Response:
```json
{
  "data": [],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

- **UUID Primary Keys**: Use UUID instead of auto-increment for better distribution
- **Audit Trail**: Track created_at, updated_at, deleted_at
- **Pagination by Default**: Prevent memory issues with large datasets
- **RESTful API**: Follow REST conventions for endpoints
- **Swagger Documentation**: Auto-generated API docs
- **Testability**: Write unit and E2E tests with >80% coverage

### 1.3 Module Dependencies

```
Products Module
    ├── Auth Module (JWT, Tenant Context, RBAC)
    ├── Users Module (User roles for authorization)
    ├── TypeORM (Database ORM)
    ├── class-validator (Input validation)
    ├── @nestjs/swagger (API documentation)
    └── csv (CSV parsing/generation)

---

## 5. Security Design

All endpoints protected by JwtAuthGuard and TenantGuard.

Authorization roles:
- Admin: Full CRUD + bulk operations
- Manager: Full CRUD + bulk operations
- User: Read-only access

Multi-tenant isolation enforced via TenantEntity base class and tenant_id filtering.

Input validation via class-validator prevents injection attacks.

Soft delete preserves data with deleted_at timestamp.

---

## 6. Implementation Details

### 6.1 Products Service

Core methods:
- create(): Creates product with auto-assigned tenant_id and UUID
- findAll(): Returns paginated list with filters applied via QueryBuilder
- findOne(): Retrieves single product by ID and tenant
- update(): Preloads existing product, applies partial updates
- remove(): Sets deleted_at timestamp (soft delete)
- restore(): Clears deleted_at timestamp
- bulkImport(): Parses CSV, validates rows, creates products in batch
- export(): Generates CSV from all tenant products

### 6.2 Products Controller

REST endpoints with Swagger annotations:
- @ApiTags('Products') for documentation grouping
- @ApiBearerAuth() for authentication requirement
- @ApiOperation() and @ApiResponse() for each endpoint

### 6.3 DTOs

CreateProductDto fields:
- name: string (required, max 255)
- description: string (optional, max 1000)
- price: number (required, min 0, max 999999999.99)
- category: string (optional, max 100)
- stock: number (optional, min 0, max 999999)
- imageUrl: string (optional, valid URL)
- isActive: boolean (optional, default true)

UpdateProductDto: All fields optional for partial updates.

ProductQueryDto: page, limit, sortBy, sortOrder, search, category, isActive, minPrice, maxPrice, inStock


---

## 7. Integration Points

### 7.1 Auth Module Integration

Uses decorators from auth module:
- @TenantId() to extract tenant context
- @CurrentUser() to get current user
- @Roles() for role-based access
- JwtAuthGuard, TenantGuard, RolesGuard

### 7.2 Frontend Integration

API base URL: NEXT_PUBLIC_API_URL

Frontend uses standard fetch/axios with JWT token in Authorization header.

---

## 8. Error Handling

### 8.1 Error Codes

- PROD-001: Invalid input data (400)
- PROD-002: Product not found (404)
- PROD-003: Category not found (404)
- PROD-004: Duplicate product name (409)
- PROD-005: Duplicate category name (409)
- PROD-006: Category not empty (400)
- PROD-007: Invalid CSV format (400)
- PROD-008: CSV file too large (413)
- PROD-009: Invalid UUID format (400)
- PROD-010: Insufficient permissions (403)

### 8.2 Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "PROD-001",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

ProductsService:
- create(): Creates product with valid data
- findAll(): Returns paginated products with filters
- findOne(): Returns product by ID
- update(): Updates product fields
- remove(): Soft deletes product
- restore(): Restores soft-deleted product
- bulkImport(): Validates and imports CSV

ProductsController:
- Each endpoint calls service with correct parameters
- Validation errors returned for invalid input
- Auth errors returned for unauthorized access

DTOs:
- Validation rules enforced correctly
- Optional fields handled properly

### 9.2 E2E Tests

- POST /products: Creates product (authenticated)
- GET /products: Lists products with pagination
- GET /products/:id: Returns product by ID
- PATCH /products/:id: Updates product
- DELETE /products/:id: Soft deletes product
- POST /products/:id/restore: Restores product
- POST /products/bulk-import: Imports CSV
- GET /products/export: Exports CSV

### 9.3 Test Data

- Test tenant: tenant-1
- Test users: admin, manager, user
- Test products: 10+ products with various categories
- Test categories: 3+ categories with hierarchy

---

## 10. Performance Optimization

### 10.1 Database Optimization

- Indexes on tenant_id, category, created_at, is_active
- QueryBuilder for optimized queries
- Pagination at database level
- Select only needed columns

### 10.2 Caching Strategy

- Cache frequently accessed products (5 min TTL)
- Invalidate cache on update/delete
- Cache category lists (10 min TTL)

### 10.3 Bulk Operations

- Batch insert (100 records per batch)
- Stream CSV parsing for large files
- Progress tracking for long operations

### 10.4 Frontend Optimization

- Debounced search (300ms)
- Pagination to limit data transfer
- Optimistic UI updates
- Loading states

---

## Next Steps

1. Review design document with team
2. Create task breakdown from design
3. Implement entities and migrations
4. Implement repositories
5. Implement services
6. Implement controllers
7. Write unit tests
8. Write E2E tests
9. Implement frontend components
10. Integration testing
11. Code review
12. Deploy to staging

---

## Approval

Role                    | Name          | Signature        | Date
------------------------|---------------|------------------|------------
Product Owner           |               |                  |
Tech Lead               |               |                  |
Security Officer        |               |                  |
QA Lead                 |               |                  |

---

Contact: For questions or clarifications, contact the Mixer Development Team.

