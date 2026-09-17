# Backend API Service

NestJS backend API service for the PMIX platform.

## Features

- **Product Management**: CRUD operations for products with advanced filtering
- **Category Management**: Hierarchical product categories
- **CSV Import/Export**: Bulk product import and export functionality
- **Multi-tenant**: Tenant isolation for data security
- **Authentication & Authorization**: JWT-based authentication with role-based access control

## Tech Stack

- **Framework**: NestJS 12
- **Database**: PostgreSQL / SQLite (TypeORM)
- **Cache**: Redis (optional)
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Vitest

## Project Structure

```
apps/backend/src/
├── modules/
│   ├── auth/              # Authentication & Authorization
│   ├── products/          # Product Management Module
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── entities/     # Database Entities
│   │   ├── interfaces/   # Repository Interfaces
│   │   ├── repositories/ # Repository Implementations
│   │   ├── services/     # Business Logic
│   │   ├── controllers/  # API Endpoints
│   │   ├── filters/      # Exception Filters
│   │   ├── constants/    # Constants & Error Codes
│   │   └── __tests__/    # Unit & E2E Tests
│   ├── settings/         # Settings Module
│   └── users/           # Users Module
├── common/              # Shared utilities
├── config/              # Configuration files
└── migrations/          # Database Migrations
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL (or SQLite for development)
- Redis (optional)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

### Database Setup

```bash
# Generate migrations (if needed)
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed
```

### Development

```bash
# Start development server
pnpm start:dev

# API will be available at http://localhost:3000/api/v1
# Swagger docs at http://localhost:3000/api/v1/docs
```

### Testing

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

### Linting

```bash
# Run ESLint
pnpm lint
```

## API Endpoints

### Products

- `POST /products` - Create product
- `GET /products` - List products with filters
- `GET /products/:id` - Get product by ID
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Soft delete product
- `POST /products/:id/restore` - Restore soft-deleted product
- `POST /products/bulk-import` - Bulk import products from CSV
- `GET /products/export` - Export products to CSV

### Categories

- `GET /products/categories` - List categories
- `POST /products/categories` - Create category
- `PATCH /products/categories/:id` - Update category
- `DELETE /products/categories/:id` - Delete category

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` - Database configuration
- `JWT_SECRET`, `JWT_EXPIRY` - JWT configuration
- `CORS_ORIGIN` - CORS configuration
- `PRODUCT_PAGE_SIZE` - Default product page size
- `PRODUCT_MAX_IMPORT_ROWS` - Maximum rows for CSV import

## Contributing

Follow the existing code patterns and conventions. Ensure all tests pass before committing.

## License

Proprietary - All rights reserved