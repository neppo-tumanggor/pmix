# System Architecture

## Overview

pmix adalah aplikasi Marketing Automation Platform yang dibangun menggunakan arsitektur monorepo dengan pendekatan enterprise-grade.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Load Balancer                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌──────────▼──────────┐
│   Frontend     │                    │   Admin Panel       │
│   (Next.js)    │                    │   (Next.js)         │
│   Port: 4080   │                    │   Port: 4081        │
└───────┬────────┘                    └──────────┬──────────┘
        │                                       │
        └───────────────────┬───────────────────┘
                            │
                    ┌───────▼────────┐
                    │  API Gateway   │
                    │   (NestJS)     │
                    │   Port: 3000   │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
   │  Auth   │         │ Products│        │Campaigns│
   │ Module  │         │ Module  │        │ Module  │
   └─────────┘         └─────────┘        └─────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼────────┐
                    │  PostgreSQL    │
                    │  Port: 5432    │
                    └────────────────┘
```

## Technology Stack

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL 16
- **Authentication**: JWT + Passport
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Class Validator
- **Testing**: Vitest

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Mantine v7
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library

### Infrastructure
- **Package Manager**: PNPM (Workspaces)
- **Build Tool**: Turborepo
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Oxlint, Prettier

## Monorepo Structure

```
pmix/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # Next.js Web App
├── tools/                # Dev tools & generators
└── docs/                 # Documentation
```

## Key Design Patterns

### Backend
1. **Domain-Driven Design (DDD)**
   - Modules represent business domains
   - Clear separation between entities, DTOs, and services

2. **Repository Pattern**
   - Abstract data access behind interfaces
   - Easy to mock for testing

3. **Dependency Injection**
   - NestJS built-in DI container
   - Promotes loose coupling

4. **CQRS (Command Query Responsibility Segregation)**
   - Separate read and write operations
   - DTOs organized by commands and queries

### Frontend
1. **Feature-Based Organization**
   - Components organized by feature
   - Easy to locate and maintain

2. **Compound Components**
   - Flexible UI composition
   - Mantine components

3. **Custom Hooks**
   - Reusable logic extraction
   - Separation of concerns

4. **State Management**
   - Zustand for global state
   - TanStack Query for server state

## Data Flow

### Request Flow
1. Client sends request to Next.js
2. Next.js API routes or client components call backend API
3. NestJS receives request through controllers
4. Business logic executed in services
5. Data accessed via repositories
6. Response returned to client

### Authentication Flow
1. User logs in via frontend
2. Credentials sent to backend
3. Backend validates and issues JWT
4. JWT stored in httpOnly cookie
5. Subsequent requests include JWT
6. Passport JWT strategy validates token

## Scalability Considerations

### Horizontal Scaling
- Stateless backend services
- Load balancer ready
- Database connection pooling

### Performance
- Redis caching for frequent queries
- CDN for static assets
- Database indexing strategy
- Query optimization

### Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention (TypeORM)
- XSS protection

## Monitoring & Observability

### Logging
- Structured logging with timestamps
- Log levels (error, warn, info, debug)
- Request/Response logging

### Metrics
- Application metrics
- Database metrics
- API response times

### Health Checks
- `/health` endpoint
- Database connectivity check
- External service health

## Deployment Strategy

### Development
- Hot reloading enabled
- Environment variables for configuration
- Local PostgreSQL installation

### Production
- Process manager (PM2) untuk Node.js
- Reverse proxy (Nginx)
- Blue-Green deployment
- Automated rollbacks
- Environment-specific configurations