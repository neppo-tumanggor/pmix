# Product Module - Requirements Document

Project: pmix - Enterprise Marketing System Platform
Module: Product Management (Product Module)
Version: 1.0.0
Date: 2026-09-17
Status: Draft
Owner: Mixer Development Team

Table of Contents

1. Overview
2. Business Requirements
3. Functional Requirements
4. Non-Functional Requirements
5. Security Requirements
6. Technical Requirements
7. User Stories
8. Acceptance Criteria
9. Dependencies & Integration
10. Constraints
11. Edge Cases & Failure Scenarios
12. Data Model Requirements
13. API Contract Requirements
14. Frontend Requirements
15. Testing Requirements
16. Documentation Requirements
17. Appendix
18. Document History
19. Approval

---

## 1. Overview

### 1.1 Purpose

The Product Management Module provides comprehensive product catalog management, inventory tracking, category organization, and product data operations for the pmix marketing platform. This module enables administrators and managers to maintain product information that can be used across marketing campaigns, analytics, and customer engagement.

### 1.2 Scope

In Scope:
- Product CRUD operations (Create, Read, Update, Delete)
- Product category management (hierarchical categories)
- Inventory tracking (stock management)
- Product search and filtering
- Pagination and sorting
- Bulk import/export (CSV)
- Soft delete and restore
- Multi-tenant data isolation
- Product status management (active/inactive)
- Image URL management

Out of Scope:
- Product variant management (size, color, SKU variants) - Future iteration
- Product review/rating system - Future iteration
- Product recommendation engine - Future iteration
- Real-time inventory sync with external systems - Future iteration
- Product image upload/storage (only URL management) - Future iteration

### 1.3 Stakeholders

End Users: View product catalogs, search products
Administrators: Full product CRUD, category management, bulk import/export
Managers: Product CRUD, category management, view reports
Developers: Integrate product APIs into other modules
Marketing Team: Use product data for campaigns
QA Team: Validate product module functionality

### 1.4 References

ISO 25010:2023 - Software Quality Requirements
ISO 27001:2022 - Information Security Management
OWASP Top 10 - Security Guidelines
NestJS Documentation - https://docs.nestjs.com
TypeORM Documentation - https://typeorm.io
Next.js Documentation - https://nextjs.org/docs

---

## 2. Business Requirements

### BR-001: Product Catalog Management

Priority: Must Have
Description: Administrators must be able to create, view, update, and delete products in the system.

Business Rules:
- Each product must belong to a tenant (multi-tenant isolation)
- Product name is required and unique within a tenant
- Product price must be non-negative
- Product stock must be non-negative integer
- Product can be marked active or inactive
- Deleted products can be restored within 30 days
- Product image is optional and stored as URL

Success Criteria:
- Admin can create product with all required fields
- Admin can view list of all products in tenant
- Admin can update product details
- Admin can delete product (soft delete)
- Admin can restore deleted product
- Product data is isolated per tenant

### BR-002: Product Category Management

Priority: Must Have
Description: Administrators must be able to organize products into categories for better catalog management.

Business Rules:
- Categories are tenant-specific
- Category name is required and unique within a tenant
- Category can have parent category (hierarchical structure)
- Maximum nesting level: 3 levels
- Category can be deleted only if no products are assigned
- Deleting category moves products to "Uncategorized"

Success Criteria:
- Admin can create category
- Admin can view category hierarchy
- Admin can update category name/parent
- Admin can delete category (with validation)
- Products can be filtered by category

### BR-003: Inventory Management

Priority: Must Have
Description: System must track product stock levels and support basic inventory operations.

Business Rules:
- Stock starts at 0 for new products
- Stock can be manually adjusted
- Stock cannot be negative
- Stock changes should be logged (future: audit trail)
- Low stock alert threshold configurable per tenant

Success Criteria:
- Admin can set initial stock when creating product
- Admin can update stock quantity
- System prevents stock from going negative
- Stock level is visible in product list
- Products with zero stock can still be active

### BR-004: Product Search and Filtering

Priority: Must Have
Description: Users must be able to search and filter products efficiently.

Business Rules:
- Search by product name (case-insensitive)
- Filter by category
- Filter by active/inactive status
- Filter by price range (min-max)
- Filter by stock availability (in stock / out of stock)
- Results paginated (default 20 items per page)
- Maximum 100 items per page

Success Criteria:
- User can search products by name
- User can combine multiple filters
- Search results are paginated
- Search responds within 200ms
- Empty results return empty array with pagination metadata

### BR-005: Bulk Operations

Priority: Should Have
Description: Administrators must be able to import and export products in bulk.

## 3. Functional Requirements

### FR-001: Create Product

Description: System must allow creation of new product with required and optional fields.

Input:
- name: string (required, max 255 chars)
- description: string (optional, max 1000 chars)
- price: number (required, min 0, max 999999999.99)
- category: string (optional, max 100 chars - category name or ID)
- stock: number (optional, default 0, min 0, max 999999)
- imageUrl: string (optional, max 500 chars, must be valid URL format)
- isActive: boolean (optional, default true)

Process:
- Validate input using class-validator
- Auto-assign tenant_id from authenticated user
- Generate UUID for product ID
- Set created_at timestamp
- Set isActive to true if not provided

Output:
- Product object with generated id, tenant_id, created_at, updated_at

### FR-002: List Products

Description: System must return paginated list of products with optional filters.

Input:
- page: number (optional, default 1, min 1)
- limit: number (optional, default 20, min 1, max 100)
- sortBy: string (optional, default "createdAt", allowed: name, price, stock, createdAt)
- sortOrder: string (optional, default "desc", allowed: asc, desc)
- search: string (optional, search by name)
- category: string (optional, filter by category name)
- isActive: boolean (optional, filter by status)
- minPrice: number (optional, filter by minimum price)
- maxPrice: number (optional, filter by maximum price)
- inStock: boolean (optional, true = stock > 0, false = stock = 0)

Process:
- Apply tenant filter
- Apply search filter (name ILIKE)
- Apply category filter
- Apply status filter
- Apply price range filter
- Apply stock availability filter
- Apply sorting
- Calculate pagination metadata
- Return paginated results

Output:
```json
{
  "data": [Product],
  "total": number,
  "page": number,
  "limit": number,
  "totalPages": number
}
```

### FR-003: Get Product by ID

Description: System must return single product by ID.

Input:
- id: string (UUID)

Process:
- Validate UUID format
- Find product by ID within tenant
- Return 404 if not found

Output:
- Product object

### FR-004: Update Product

Description: System must update product details (partial update).

Input:
- id: string (UUID)
- name?: string (optional)
- description?: string (optional)
- price?: number (optional)
- category?: string (optional)
- stock?: number (optional)
- imageUrl?: string (optional)
- isActive?: boolean (optional)

Process:
- Validate input
- Preload existing product
- Apply updates
- Set updated_at timestamp
- Save changes

Output:
- Updated Product object

### FR-005: Delete Product

Description: System must soft delete product.

Input:
- id: string (UUID)

Process:
- Validate UUID format
- Find product by ID within tenant
- Set deleted_at timestamp
- Mark as deleted (soft delete)

Output:
- 204 No Content

### FR-006: Restore Product

Description: System must restore soft-deleted product.

Input:
- id: string (UUID)

Process:
- Validate UUID format
- Find product by ID within tenant (including soft deleted)
- Clear deleted_at timestamp
- Restore product

Output:
- Restored Product object

### FR-007: Category Management

Description: System must support product category CRUD operations.

Operations:
- GET /products/categories - List all categories (flat or hierarchical)
- POST /products/categories - Create category
- PATCH /products/categories/:id - Update category
- DELETE /products/categories/:id - Delete category

Category Fields:
- id: UUID
- name: string (required, max 100 chars)
- parentId: string (optional, UUID of parent category)
- description: string (optional)
- tenant_id: string
- created_at: datetime
- updated_at: datetime

### FR-008: Stock Management

Description: System must support stock adjustment operations.

Operations:
- Direct update via PATCH /products/:id (update stock field)
- Future: Dedicated endpoint for stock adjustment with audit trail

Validation:
- Stock cannot be negative
- Stock must be integer

### FR-009: Bulk Import

Description: System must import multiple products from CSV file.

Input:
- CSV file with headers
- Max 1000 rows per import

CSV Format:
```
name,description,price,category,stock,imageUrl,isActive
"Product 1","Description 1",100000,"Electronics",50,"https://example.com/img1.jpg",true
```

Process:
- Parse CSV
- Validate each row
- Skip invalid rows (collect errors)
- Create valid products in batch
- Return import report

Output:
```json
{
  "success": number,
  "failed": number,
  "errors": [
    { "row": 2, "error": "Invalid price format" }
  ]
}
```

### FR-010: Bulk Export

Description: System must export all products to CSV file.

Output:
- CSV file with all product fields
- Filename: products-export-{timestamp}.csv


Business Rules:
- Import accepts CSV format
- CSV must have headers: name, description, price, category, stock, imageUrl, isActive
- Import validates each row
- Invalid rows are skipped with error report
- Maximum 1000 products per import
- Export generates CSV with all tenant products
- Export includes all product fields

Success Criteria:
- Admin can upload CSV file
- System shows import progress and error report
- Valid products are imported
- Invalid rows are reported with row number and error
- Admin can download all products as CSV

### BR-006: Product Status Management

Priority: Must Have
Description: Products can be activated or deactivated without deletion.

Business Rules:
- Active products are visible in search and list
- Inactive products are hidden from default view
- Inactive products can still be accessed by ID
- Bulk activate/deactivate supported
- Deactivated products remain in database

Success Criteria:
- Admin can toggle product status
- Inactive products don't appear in default list
- Inactive products can be explicitly fetched
- Bulk status change works for multiple products


## 4. Non-Functional Requirements

### NFR-001: Performance

- API response time: < 200ms for 95th percentile
- List endpoint with pagination: < 150ms
- Search endpoint: < 200ms
- Bulk import (1000 products): < 5 seconds
- Bulk export (10000 products): < 3 seconds
- Database query optimization with proper indexes

### NFR-002: Scalability

- Support 10,000+ products per tenant
- Support 100+ concurrent tenants
- Pagination prevents memory issues
- Database indexes on frequently queried fields

### NFR-003: Availability

- Uptime: 99.5% (excluding scheduled maintenance)
- Graceful degradation under high load
- Error responses with meaningful messages

### NFR-004: Compatibility

- SQLite (development)
- PostgreSQL (production)
- No database-specific features (use TypeORM abstractions)
- Works with NestJS 12.x
- Works with Next.js 14.x

### NFR-005: Usability

- API follows RESTful conventions
- Consistent response format
- Meaningful error messages
- Swagger documentation available

## 5. Security Requirements

### SR-001: Authentication

- All product endpoints require authentication
- JWT token validation via JwtAuthGuard
- Invalid/expired token returns 401

### SR-002: Authorization

- Role-based access control:
  - Admin: Full CRUD, bulk operations
  - Manager: Full CRUD, bulk operations
  - User: Read-only access
- Tenant data isolation enforced via TenantGuard
- Users cannot access products from other tenants

### SR-003: Input Validation

- All inputs validated using class-validator
- String length limits enforced
- Numeric ranges enforced
- URL format validation for imageUrl
- SQL injection prevention via parameterized queries (TypeORM)

### SR-004: Data Protection

- No sensitive data exposed in API responses
- Soft delete prevents data loss
- Audit timestamps for all changes (created_at, updated_at, deleted_at)

### SR-005: Rate Limiting

- Apply global rate limiting (existing system)
- Bulk operations have additional validation

## 6. Technical Requirements

### TR-001: Technology Stack

- Backend: NestJS 12.x
- ORM: TypeORM 1.1.x
- Database: SQLite (dev), PostgreSQL (prod)
- Validation: class-validator 0.15.x
- Documentation: @nestjs/swagger
- Testing: Vitest 4.x
- Frontend: Next.js 14.x, React 18.x

### TR-002: Architecture Patterns

- Repository pattern with interface
- Service layer for business logic
- DTOs for input validation
- Entity classes for data model
- Controller for API endpoints
- Multi-tenant via TenantEntity base class

### TR-003: Code Quality

- TypeScript strict mode
- ESLint + Oxlint
- Prettier formatting
- Unit test coverage > 80%
- E2E test coverage for critical flows

## 7. User Stories

### US-001: Create Product

As an Administrator
I want to create a new product with name, price, and category
So that I can add products to the catalog

Acceptance Criteria:
- Form with required fields: name, price
- Optional fields: description, category, stock, imageUrl, isActive
- Validation errors displayed inline
- Success toast notification
- Product appears in list after creation

### US-002: View Product List

As a User
I want to view a paginated list of products
So that I can browse available products

Acceptance Criteria:
- Table displays product name, category, price, stock, status
- Pagination controls at bottom
- Can change page size (20, 50, 100)
- Loading spinner while fetching
- Empty state message when no products

### US-003: Search Products

As a User
I want to search products by name
So that I can quickly find specific products

Acceptance Criteria:
- Search input in page header
- Real-time search (debounced 300ms)
- Search is case-insensitive
- Search combined with other filters
- Clear search button

### US-004: Filter Products

As a User
I want to filter products by category, status, and price range
So that I can narrow down results

Acceptance Criteria:
- Filter sidebar or dropdown
- Category dropdown with all categories
- Status toggle (active/inactive)
- Price range min/max inputs
- Apply/Clear filter buttons
- Filter count badge

### US-005: Edit Product

As an Administrator
I want to edit product details
So that I can update product information

Acceptance Criteria:
- Click edit button opens modal/dialog
- Form pre-filled with existing data
- Save updates product
- Cancel discards changes
- Success toast notification

### US-006: Delete Product

As an Administrator
I want to delete a product
So that I can remove outdated products

Acceptance Criteria:
- Click delete shows confirmation dialog
- Confirmation dialog explains action is reversible
- Confirm deletes product (soft delete)
- Cancel aborts deletion
- Success toast notification
- Product removed from default list

### US-007: Restore Deleted Product

As an Administrator
I want to restore a deleted product
So that I can recover accidentally deleted products

Acceptance Criteria:
- "Show deleted" toggle in filters
- Deleted products shown with "Deleted" badge
- Restore button on deleted products
- Restore brings product back to active status

### US-008: Manage Categories

As an Administrator
I want to create and manage product categories
So that I can organize products

Acceptance Criteria:
- Category list page
- Add category button
- Edit category inline or in modal
- Delete category with confirmation
- Category count shown
- Parent category selector for hierarchy

### US-009: Bulk Import

As an Administrator
I want to import multiple products from CSV
So that I can quickly add many products

Acceptance Criteria:
- Upload CSV file button
- Template download link
- Progress indicator during import
- Success/error report after import
- Option to download error report
- Validation before import

### US-010: Bulk Export

As an Administrator
I want to export products to CSV
So that I can backup or analyze data externally

Acceptance Criteria:
- Export button in page header
- Downloads CSV file
- Filename includes timestamp
- All product fields included
- Loading indicator during export


## 8. Acceptance Criteria

### AC-001: Product CRUD Operations

- [ ] POST /api/v1/products creates product with valid data
- [ ] GET /api/v1/products returns paginated list
- [ ] GET /api/v1/products/:id returns single product
- [ ] PATCH /api/v1/products/:id updates product
- [ ] DELETE /api/v1/products/:id soft deletes product
- [ ] All operations enforce tenant isolation
- [ ] All operations require authentication

### AC-002: Pagination

- [ ] Default page size is 20
- [ ] Maximum page size is 100
- [ ] Response includes total, page, limit, totalPages
- [ ] Page numbers are 1-indexed
- [ ] Out-of-range page returns empty data

### AC-003: Search and Filter

- [ ] Search by name is case-insensitive
- [ ] Filter by category works
- [ ] Filter by isActive works
- [ ] Filter by price range works
- [ ] Filter by stock availability works
- [ ] Multiple filters can be combined
- [ ] Empty search returns all products

### AC-004: Categories

- [ ] Categories are tenant-specific
- [ ] Category name is unique within tenant
- [ ] Category can have parent category
- [ ] Deleting category moves products to "Uncategorized"
- [ ] Category list can be hierarchical

### AC-005: Soft Delete

- [ ] Delete sets deleted_at timestamp
- [ ] Deleted products excluded from default list
- [ ] Deleted products can be restored
- [ ] Restore clears deleted_at timestamp
- [ ] Soft deleted products can be accessed by ID

### AC-006: Bulk Operations

- [ ] CSV import accepts valid CSV format
- [ ] Invalid rows are skipped with error report
- [ ] Import report shows success/failed counts
- [ ] Export generates valid CSV
- [ ] Export includes all product fields

### AC-007: Multi-Tenant Isolation

- [ ] Products from different tenants are not accessible
- [ ] Tenant ID is auto-assigned from authenticated user
- [ ] Tenant filter is enforced at repository level
- [ ] Tenant cannot access other tenant's categories

### AC-008: Input Validation

- [ ] Name is required and max 255 chars
- [ ] Price is required, non-negative, max 999999999.99
- [ ] Stock is non-negative integer
- [ ] ImageUrl is valid URL format
- [ ] Invalid input returns 400 with validation errors

### AC-009: Authorization

- [ ] Admin can perform all operations
- [ ] Manager can perform all operations
- [ ] User can only read products
- [ ] Unauthenticated requests return 401
- [ ] Forbidden operations return 403

### AC-010: Frontend Integration

- [ ] Products page displays product list
- [ ] Search and filters work
- [ ] Create/Edit modal works
- [ ] Delete confirmation works
- [ ] Toast notifications display
- [ ] Loading states shown
- [ ] Error messages displayed
- [ ] Pagination works

## 9. Dependencies & Integration

### 9.1 Internal Dependencies

- Auth Module: Authentication, JWT tokens, tenant context
- Users Module: User roles and permissions
- Settings Module: Tenant configuration (future)

### 9.2 External Dependencies

- None

### 9.3 Integration Points

- Auth Module: JwtAuthGuard, TenantGuard, RolesGuard, TenantId decorator
- Database: TypeORM with SQLite/PostgreSQL
- Frontend: Next.js consuming REST API

## 10. Constraints

### 10.1 Technical Constraints

- Must use NestJS framework
- Must use TypeORM for database access
- Must support SQLite and PostgreSQL
- Must use UUID for primary keys
- Must inherit from TenantEntity for multi-tenant
- Must use class-validator for DTO validation
- Must use @nestjs/swagger for API documentation
- Must use Vitest for testing

### 10.2 Business Constraints

- Soft delete retention: 30 days
- Maximum 1000 products per bulk import
- Maximum 100 products per page
- Category hierarchy max depth: 3 levels
- Product name max length: 255 characters

### 10.3 Security Constraints

- All endpoints require authentication
- Tenant data isolation mandatory
- Role-based access control required
- Input validation required on all endpoints

## 11. Edge Cases & Failure Scenarios

### 11.1 Edge Cases

- Product with stock = 0 (should be allowed, just marked as out of stock)
- Product without category (allowed, shown as "Uncategorized")
- Category with no products (allowed, shown in category list)
- Category with parent and children (hierarchical display)
- Very long product name (truncated to 255 chars)
- Price with many decimal places (rounded to 2 decimals)
- Concurrent product updates (use preload to prevent lost update)
- Tenant with no products (return empty array with pagination metadata)
- Search with special characters (escaped properly)
- Import CSV with BOM (byte order mark)
- Import CSV with different line endings (Windows/Mac/Linux)
- ImageUrl with HTTP/HTTPS (both allowed)
- ImageUrl with relative path (rejected by validation)

### 11.2 Failure Scenarios

- Database connection failure: Return 500 with error message
- Invalid UUID format: Return 400 with validation error
- Product not found: Return 404 with error message
- Duplicate product name within tenant: Return 409 with error message (future: unique constraint)
- Category not empty when deleting: Return 400 with error message
- CSV import with all invalid rows: Return error report with 0 success
- CSV file too large (> 10MB): Return 413 Payload Too Large
- Authentication token expired: Return 401 Unauthorized
- Insufficient permissions: Return 403 Forbidden
- Validation error: Return 400 with field-level errors
- Tenant context missing: Return 401 Unauthorized


## 12. Data Model Requirements

### 12.1 Product Entity

Table: products

Fields:
- id: UUID (Primary Key, auto-generated)
- tenant_id: VARCHAR(255) (Indexed, required)
- name: VARCHAR(255) (Required)
- description: TEXT (Nullable, max 1000 chars)
- price: DECIMAL(10,2) (Required, min 0)
- category: VARCHAR(100) (Nullable, category name or reference)
- stock: INTEGER (Required, default 0, min 0)
- image_url: VARCHAR(500) (Nullable, valid URL)
- is_active: BOOLEAN (Default true)
- created_at: DATETIME (Auto-generated)
- updated_at: DATETIME (Auto-updated)
- deleted_at: DATETIME (Nullable, soft delete)

Indexes:
- idx_products_tenant_id ON tenant_id
- idx_products_category ON category
- idx_products_created_at ON created_at
- idx_products_tenant_deleted ON (tenant_id, deleted_at)

Constraints:
- tenant_id + deleted_at for multi-tenant soft delete queries
- stock >= 0
- price >= 0

### 12.2 Product Category Entity

Table: product_categories

Fields:
- id: UUID (Primary Key, auto-generated)
- tenant_id: VARCHAR(255) (Indexed, required)
- name: VARCHAR(100) (Required, unique within tenant)
- parent_id: UUID (Nullable, self-referencing foreign key)
- description: TEXT (Nullable)
- created_at: DATETIME (Auto-generated)
- updated_at: DATETIME (Auto-updated)
- deleted_at: DATETIME (Nullable, soft delete)

Indexes:
- idx_categories_tenant_id ON tenant_id
- idx_categories_parent_id ON parent_id
- idx_categories_tenant_name ON (tenant_id, name) UNIQUE

Constraints:
- parent_id must reference valid category in same tenant
- Max nesting level: 3 (enforced at application level)
- Circular references prevented (parent cannot be descendant)

## 13. API Contract Requirements

### 13.1 Base URL

/api/v1

### 13.2 Authentication

All endpoints require:
- Authorization: Bearer {jwt_token}
- X-Tenant-ID header (extracted from JWT by TenantGuard)

### 13.3 Standard Response Format

Success:
```json
{
  "data": {},
  "message": "Success"
}
```

Error:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### 13.4 Pagination Response Format

```json
{
  "data": [],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### 13.5 Product Endpoints

#### POST /products
Create new product

Request Body:
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 100000,
  "category": "Electronics",
  "stock": 50,
  "imageUrl": "https://example.com/image.jpg",
  "isActive": true
}
```

Response: 201 Created
```json
{
  "id": "uuid",
  "name": "Product Name",
  "description": "Product description",
  "price": 100000.00,
  "category": "Electronics",
  "stock": 50,
  "imageUrl": "https://example.com/image.jpg",
  "isActive": true,
  "tenantId": "tenant-uuid",
  "createdAt": "2026-09-17T...",
  "updatedAt": "2026-09-17T..."
}
```

#### GET /products
List products with pagination and filters

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- sortBy: string (default: "createdAt")
- sortOrder: string (default: "desc")
- search: string (optional)
- category: string (optional)
- isActive: boolean (optional)
- minPrice: number (optional)
- maxPrice: number (optional)
- inStock: boolean (optional)

Response: 200 OK
```json
{
  "data": [],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

#### GET /products/:id
Get product by ID

Response: 200 OK
```json
{
  "id": "uuid",
  "name": "Product Name",
  ...
}
```

Error: 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Product not found"
}
```

#### PATCH /products/:id
Update product

Request Body: Partial product object

Response: 200 OK
```json
{
  "id": "uuid",
  "name": "Updated Name",
  ...
}
```

#### DELETE /products/:id
Soft delete product

Response: 204 No Content

#### POST /products/:id/restore
Restore soft-deleted product

Response: 200 OK
```json
{
  "id": "uuid",
  "name": "Product Name",
  "deletedAt": null,
  ...
}
```

### 13.6 Category Endpoints

#### GET /products/categories
List all categories

Query Parameters:
- hierarchical: boolean (default: false, return tree structure)

Response: 200 OK
```json
[
  {
    "id": "uuid",
    "name": "Electronics",
    "parentId": null,
    "description": "Electronic products"
  }
]
```

#### POST /products/categories
Create category

Request Body:
```json
{
  "name": "Electronics",
  "parentId": null,
  "description": "Electronic products"
}
```

Response: 201 Created

#### PATCH /products/categories/:id
Update category

Request Body: Partial category object

Response: 200 OK

#### DELETE /products/categories/:id
Delete category

Response: 204 No Content

### 13.7 Bulk Operation Endpoints

#### POST /products/bulk-import
Import products from CSV

Request: multipart/form-data
- file: CSV file

Response: 200 OK
```json
{
  "success": 95,
  "failed": 5,
  "errors": [
    { "row": 3, "error": "Invalid price format" }
  ]
}
```

#### GET /products/export
Export products to CSV

Response: 200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="products-export-2026-09-17.csv"


## 14. Frontend Requirements

### 14.1 Products Page

URL: /products

Components:
- ProductsPage (main page)
- ProductTable (data table)
- ProductForm (create/edit dialog)
- DeleteConfirmation (alert dialog)
- SearchBar (search input)
- FilterPanel (category, status, price filters)
- Pagination (page controls)
- Toast notifications

Features:
- Display products in table
- Search by name (debounced)
- Filter by category, status, price range
- Pagination (20, 50, 100 per page)
- Sort by name, price, date
- Create new product (dialog)
- Edit product (dialog)
- Delete product (confirmation dialog)
- Restore deleted products (filter toggle)
- Loading states
- Error states
- Empty states

### 14.2 Product Form Dialog

Fields:
- Name: text input (required)
- Description: textarea (optional)
- Price: number input (required, formatted as currency)
- Category: select dropdown (optional)
- Stock: number input (optional)
- ImageUrl: text input (optional)
- IsActive: checkbox (default checked)

Validation:
- Name required
- Price required and non-negative
- Stock non-negative
- ImageUrl valid URL format

Actions:
- Submit (create or update)
- Cancel (close dialog)

### 14.3 Categories Page (Future)

URL: /products/categories

Features:
- List categories
- Create category
- Edit category
- Delete category
- Hierarchical tree view

### 14.4 API Integration

Base URL: NEXT_PUBLIC_API_URL (default: http://localhost:1457)

Endpoints:
- GET /api/v1/products
- POST /api/v1/products
- GET /api/v1/products/:id
- PATCH /api/v1/products/:id
- DELETE /api/v1/products/:id
- POST /api/v1/products/:id/restore
- GET /api/v1/products/categories

Response Handling:
- Parse JSON responses
- Handle error responses
- Display toast notifications for success/error
- Show loading spinners during requests

### 14.5 State Management

Local State (useState):
- products: Product[]
- loading: boolean
- error: string | null
- pagination: { total, page, limit, totalPages }
- filters: { search, category, isActive, minPrice, maxPrice }
- dialog: { open, mode, product }

No global state required (can use React Query in future for caching)

## 15. Testing Requirements

### 15.1 Unit Tests

Coverage Target: > 80%

ProductsService:
- [ ] create() - creates product with valid data
- [ ] create() - defaults isActive to true
- [ ] findAll() - returns paginated products
- [ ] findAll() - applies filters correctly
- [ ] findOne() - returns product by ID
- [ ] findOne() - throws NotFoundException for invalid ID
- [ ] update() - updates product fields
- [ ] update() - throws NotFoundException for invalid ID
- [ ] remove() - soft deletes product
- [ ] remove() - throws NotFoundException for invalid ID
- [ ] restore() - restores soft-deleted product
- [ ] restore() - throws NotFoundException for invalid ID

ProductsController:
- [ ] create() - calls service with DTO
- [ ] findAll() - calls service with query params
- [ ] findOne() - calls service with ID
- [ ] update() - calls service with ID and DTO
- [ ] remove() - calls service with ID
- [ ] restore() - calls service with ID

DTOs:
- [ ] CreateProductDto - validates required fields
- [ ] CreateProductDto - validates string lengths
- [ ] CreateProductDto - validates numeric ranges
- [ ] UpdateProductDto - validates optional fields
- [ ] UpdateProductDto - allows partial updates

### 15.2 E2E Tests

Products E2E:
- [ ] POST /api/v1/products - creates product (authenticated)
- [ ] POST /api/v1/products - returns 401 without auth
- [ ] GET /api/v1/products - returns paginated list
- [ ] GET /api/v1/products/:id - returns product
- [ ] GET /api/v1/products/:id - returns 404 for invalid ID
- [ ] PATCH /api/v1/products/:id - updates product
- [ ] DELETE /api/v1/products/:id - soft deletes product
- [ ] POST /api/v1/products/:id/restore - restores product
- [ ] GET /api/v1/products - applies filters
- [ ] GET /api/v1/products - pagination works
- [ ] POST /api/v1/products - validates input
- [ ] GET /api/v1/products - enforces tenant isolation

### 15.3 Test Data

- Test tenant: "tenant-1"
- Test user: admin, manager, user
- Test products: 10+ products with various categories, prices, stock levels
- Test categories: 3+ categories with hierarchy

### 15.4 Test Environment

- Database: SQLite in-memory or test file
- Authentication: Mock JWT tokens
- Seeds: Pre-populate test data

## 16. Documentation Requirements

### 16.1 Developer Documentation

- API endpoint documentation (Swagger)
- Data model documentation
- Repository interface documentation
- Service method documentation
- DTO field documentation
- Error code reference
- Setup and configuration guide

### 16.2 API Documentation

- Interactive Swagger UI at /api
- OpenAPI spec available
- Request/response examples
- Authentication requirements
- Error response formats
- Rate limiting information

### 16.3 User Documentation

- Product management guide
- Category management guide
- Bulk import instructions
- Bulk export instructions
- Search and filter guide
- Troubleshooting guide

### 16.4 Code Documentation

- JSDoc comments on public methods
- README in products module directory
- Architecture decision records (ADR) if needed


## 17. Appendix

### A. Error Codes Reference

Code | HTTP Status | Description
-----|-------------|------------
PROD-001 | 400 | Invalid input data
PROD-002 | 404 | Product not found
PROD-003 | 404 | Category not found
PROD-004 | 409 | Product name already exists
PROD-005 | 409 | Category name already exists
PROD-006 | 400 | Category is not empty
PROD-007 | 400 | Invalid CSV format
PROD-008 | 413 | CSV file too large
PROD-009 | 400 | Invalid UUID format
PROD-010 | 403 | Insufficient permissions
PROD-011 | 401 | Authentication required
PROD-012 | 500 | Internal server error

### B. Validation Rules

Product Name:
- Required
- String
- Min length: 1
- Max length: 255

Product Price:
- Required
- Number
- Min: 0
- Max: 999999999.99
- Precision: 2 decimals

Product Stock:
- Required
- Integer
- Min: 0
- Max: 999999

Product Description:
- Optional
- String
- Max length: 1000

Category Name:
- Required
- String
- Min length: 1
- Max length: 100
- Unique within tenant

ImageUrl:
- Optional
- String
- Max length: 500
- Must be valid URL format (http/https)

### C. CSV Import Format

Required Headers:
- name
- price

Optional Headers:
- description
- category
- stock
- imageUrl
- isActive

Example:
```csv
name,description,price,category,stock,imageUrl,isActive
"Laptop Pro 15","High performance laptop",15000000,"Electronics",10,"https://example.com/laptop.jpg",true
"Wireless Mouse","Ergonomic wireless mouse",250000,"Accessories",50,"https://example.com/mouse.jpg",true
```

### D. Environment Variables

# Product Module Configuration
PRODUCT_PAGE_SIZE=20
PRODUCT_MAX_PAGE_SIZE=100
PRODUCT_MAX_IMPORT_ROWS=1000
PRODUCT_MAX_IMPORT_SIZE=10485760
PRODUCT_SEARCH_DEBOUNCE=300

## 18. Document History

Version | Date       | Author         | Changes
--------|------------|----------------|----------------------------------
1.0      | 2026-09-17 | Mixer Team     | Initial requirements document

## 19. Approval

Role                    | Name          | Signature        | Date
------------------------|---------------|------------------|------------
Product Owner           |               |                  |
Tech Lead               |               |                  |
Security Officer        |               |                  |
QA Lead                 |               |                  |

## Next Steps

1. Review requirements with stakeholders
2. Prioritize features for MVP
3. Create technical design document
4. Implement module following DDD pattern
5. Write comprehensive tests
6. Deploy to staging environment
7. User acceptance testing
8. Deploy to production

---

Contact: For questions or clarifications, contact the Mixer Development Team.

