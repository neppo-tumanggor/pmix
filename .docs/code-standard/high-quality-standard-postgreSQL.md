# High Quality PostgreSQL Standard 2026
## Enterprise-Grade Database Standards

**Project**: Mixer - Enterprise Marketing Automation Platform  
**Database**: PostgreSQL 15.x+ (latest stable)  
**Standard Version**: 2026.1  
**ORM**: TypeORM 0.3.x+  
**Last Updated**: 2026-09-07

---

## 📋 TABLE OF CONTENTS

1. [Naming Conventions](#naming-conventions)
2. [Schema Design](#schema-design)
3. [Data Types](#data-types)
4. [Constraints & Indexes](#constraints--indexes)
5. [Multi-Tenancy Patterns](#multi-tenancy-patterns)
6. [Performance Optimization](#performance-optimization)
7. [Security Standards](#security-standards)
8. [Backup & Recovery](#backup--recovery)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Migration Standards](#migration-standards)
11. [Query Standards](#query-standards)
12. [High Availability](#high-availability)
13. [Official References](#official-references)

---

## 🎯 CORE PRINCIPLES

1. **Data Integrity** - Constraints, foreign keys, check constraints
2. **Performance** - Proper indexing, query optimization, connection pooling
3. **Scalability** - Partitioning, read replicas, connection management
4. **Security** - Encryption, access control, audit logging
5. **Maintainability** - Clear naming, documentation, version control
6. **Reliability** - Backups, replication, failover

---

## 🏷️ NAMING CONVENTIONS

### **1. Database Naming**

```yaml
Database Name Format:
  Production: mixer_production
  Staging: mixer_staging
  Development: mixer_development
  
Naming Rules:
  - Use snake_case
  - Lowercase only
  - No special characters except underscore
  - Max 63 characters (PostgreSQL limit)
```

---

### **2. Schema Naming**

```sql
-- Schema naming conventions
-- 1. Public schema (shared tables)
CREATE SCHEMA IF NOT EXISTS public;

-- 2. Tenant-specific schemas (multi-tenancy)
CREATE SCHEMA IF NOT EXISTS tenant_abc123;
CREATE SCHEMA IF NOT EXISTS tenant_xyz789;

-- 3. Extension schemas (for extensions)
CREATE SCHEMA IF NOT EXISTS extensions;

-- 4. Audit schema (for audit logs)
CREATE SCHEMA IF NOT EXISTS audit;

-- 5. Temporary schema (for temp tables)
CREATE SCHEMA IF NOT EXISTS temp;
```

---

### **3. Table Naming**

```typescript
// ✅ GOOD: snake_case, plural, descriptive
@Entity('users')
@Entity('refresh_tokens')
@Entity('campaign_templates')
@Entity('email_verification_tokens')
@Entity('audit_logs')

// ❌ BAD
@Entity('User') // PascalCase
@Entity('user') // Singular (should be plural)
@Entity('tbl_users') // Hungarian notation
@Entity('usrs') // Abbreviation
```

---

### **4. Column Naming**

```typescript
// ✅ GOOD: snake_case, descriptive, no abbreviations
@Entity('users')
export class User {
  @Column({ name: 'id' })
  id: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'email_verified_at' })
  emailVerifiedAt: Date;

  @Column({ name: 'failed_login_attempts' })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until' })
  lockedUntil: Date;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at' })
  deletedAt: Date;
}

// ❌ BAD
@Entity('users')
export class User {
  @Column({ name: 'ID' }) // Uppercase
  id: string;

  @Column({ name: 'Email' }) // PascalCase
  email: string;

  @Column({ name: 'pwd' }) // Abbreviation
  password: string;

  @Column({ name: 'createdAt' }) // camelCase
  createdAt: Date;
}
```

---

### **5. Index Naming**

```sql
-- ✅ GOOD: idx_{table}_{columns}
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id_created_at ON users(tenant_id, created_at);
CREATE INDEX idx_campaigns_status_created_at ON campaigns(status, created_at);

-- ✅ GOOD: Unique index: uq_{table}_{columns}
CREATE UNIQUE INDEX uq_users_email ON users(email);
CREATE UNIQUE INDEX uq_users_tenant_id_email ON users(tenant_id, email);

-- ✅ GOOD: Foreign key index: fk_{table}_{column}
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- ❌ BAD
CREATE INDEX my_index; // Not descriptive
CREATE INDEX idx1; // Not descriptive
```

---

### **6. Constraint Naming**

```sql
-- ✅ GOOD: {type}_{table}_{columns}
ALTER TABLE users ADD CONSTRAINT pk_users_id PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
ALTER TABLE orders ADD CONSTRAINT fk_orders_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE users ADD CONSTRAINT chk_users_age 
  CHECK (age >= 18);

-- ❌ BAD
ALTER TABLE users ADD CONSTRAINT pk1 PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT my_constraint UNIQUE (email);
```

---

## 🏗️ SCHEMA DESIGN

### **1. Standard Entity Template**

```typescript
// entities/base.entity.ts
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}

// entities/tenant-entity.ts
export abstract class TenantEntity extends BaseEntity {
  @Column({ name: 'tenant_id', length: 255 })
  tenantId: string;

  @Column({ name: 'created_by', length: 255, nullable: true })
  createdBy: string | null;

  @Column({ name: 'updated_by', length: 255, nullable: true })
  updatedBy: string | null;
}

// entities/auditable-entity.ts
export abstract class AuditableEntity extends TenantEntity {
  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
```

---

### **2. Soft Delete Pattern**

```typescript
// ✅ GOOD: Soft delete with deleted_at
@Entity('users')
export class User extends AuditableEntity {
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;
}

// Repository with soft delete
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  // Find all non-deleted (default)
  async findAll(): Promise<User[]> {
    return this.repository.find({
      where: { deletedAt: null },
    });
  }

  // Find including deleted
  async findAllWithDeleted(): Promise<User[]> {
    return this.repository.find({
      withDeleted: true,
    });
  }

  // Soft delete
  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  // Restore soft deleted
  async restore(id: string): Promise<void> {
    await this.repository.restore(id);
  }

  // Permanent delete (GDPR right to be forgotten)
  async permanentDelete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

// Global filter (optional)
@Entity('users')
@Exclude() // Exclude from some operations
export class User extends AuditableEntity {
  // ...
}

// Global scope in repository
createQueryBuilder(alias?: string) {
  const queryBuilder = super.createQueryBuilder(alias);
  
  // Always exclude soft deleted by default
  if (!this.options?.withDeleted) {
    queryBuilder.andWhere(`${alias}.deleted_at IS NULL`);
  }

  return queryBuilder;
}
```

---

### **3. Audit Trail Pattern**

```typescript
// entities/audit-log.entity.ts
@Entity('audit_logs')
@Index(['tenantId', 'userId', 'action', 'timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 255 })
  tenantId: string;

  @Column({ name: 'user_id', length: 255, nullable: true })
  userId: string | null;

  @Column({ name: 'action', length: 100 })
  action: string; // 'user.created', 'campaign.sent', 'api_key.revoked'

  @Column({ name: 'resource_type', length: 50 })
  resourceType: string;

  @Column({ name: 'resource_id', length: 255 })
  resourceId: string;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', length: 500 })
  userAgent: string;

  @Column({ name: 'timestamp', type: 'timestamp' })
  timestamp: Date;
}

-- PostgreSQL trigger for automatic audit logging
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    NEW.tenant_id,
    current_setting('app.current_user_id', true),
    TG_OP || '.' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    NEW.id,
    row_to_json(OLD),
    row_to_json(NEW),
    current_setting('app.current_ip_address', true),
    current_setting('app.current_user_agent', true),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

### **4. Multi-Tenancy Patterns**

#### **Pattern 1: Shared Schema with Tenant ID (Recommended for SMB)**

```typescript
// entities/user.entity.ts
@Entity('users')
@Index(['tenantId', 'email'], { unique: true })
@Index(['tenantId', 'createdAt'])
export class User extends AuditableEntity {
  @Column({ name: 'email', length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date | null;
}

-- Query with tenant isolation
SELECT * FROM users 
WHERE tenant_id = 'tenant_abc123' 
  AND deleted_at IS NULL 
  AND email = 'user@example.com';

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation_policy ON users
  USING (tenant_id = current_setting('app.current_tenant_id'));

-- Set tenant context
SET app.current_tenant_id = 'tenant_abc123';
```

---

#### **Pattern 2: Schema-per-Tenant (Recommended for Enterprise)**

```typescript
// Create tenant schema
CREATE SCHEMA tenant_abc123;

-- Create tables in tenant schema
CREATE TABLE tenant_abc123.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE tenant_abc123.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Query tenant schema
SET search_path TO tenant_abc123;
SELECT * FROM users;
```

**Comparison**:

| Aspect | Shared Schema | Schema-per-Tenant |
|--------|--------------|-------------------|
| **Isolation** | Row-level | Schema-level |
| **Performance** | Better for small tenants | Better for large tenants |
| **Backup** | Complex (per-tenant export) | Easy (per-schema dump) |
| **Migrations** | Single migration | Multiple migrations |
| **Connection Pool** | Shared | Per-tenant (higher cost) |
| **GDPR Deletion** | Harder (scan all rows) | Easy (drop schema) |

---

## 📊 DATA TYPES

### **1. Recommended Data Types**

```typescript
// ✅ GOOD: Use appropriate PostgreSQL types
@Entity('users')
export class User {
  // UUID (preferred over serial/int for distributed systems)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // VARCHAR with length limit
  @Column({ length: 255 })
  email: string;

  // TEXT for unlimited length
  @Column({ type: 'text' })
  bio: string;

  // BOOLEAN
  @Column({ default: false })
  isActive: boolean;

  // INTEGER with constraints
  @Column({ type: 'int' })
  age: number;

  // DECIMAL for precise calculations (pricing, etc.)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  // TIMESTAMP with timezone
  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  // JSONB for flexible schema (preferred over JSON)
  @Column({ type: 'jsonb' })
  metadata: Record<string, any>;

  // ARRAY for lists
  @Column({ type: 'simple-array' })
  tags: string[];

  // ENUM for limited options
  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'] })
  status: string;

  // BYTEA for binary data (encrypted data, files)
  @Column({ type: 'bytea' })
  encryptedData: Buffer;
}

// ❌ BAD
@Entity('users')
export class User {
  @Column() // Missing type - uses text
  id: string;

  @Column() // Missing length
  email: string;

  @Column({ type: 'float' }) // imprecise for money
  price: number;
}
```

---

### **2. Custom ENUM Types**

```sql
-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member', 'viewer');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed');
CREATE TYPE email_status AS ENUM ('queued', 'sent', 'delivered', 'bounced', 'opened', 'clicked', 'failed');

-- Use ENUM in table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'member'
);

-- Alter ENUM (requires careful migration)
ALTER TYPE user_role ADD VALUE 'super_admin' AFTER 'admin';
```

---

### **3. JSONB Best Practices**

```typescript
// ✅ GOOD: JSONB for flexible metadata
@Entity('campaigns')
export class Campaign extends TenantEntity {
  @Column({ type: 'jsonb' })
  settings: {
    sendTime?: Date;
    timezone?: string;
    trackingEnabled?: boolean;
    customHeaders?: Record<string, string>;
  };

  @Column({ type: 'jsonb' })
  analytics: {
    opens: number;
    clicks: number;
    bounces: number;
    lastUpdated: Date;
  };
}

-- Query JSONB fields
-- 1. Access nested field
SELECT email, settings->'sendTime' AS send_time FROM campaigns;

-- 2. Check if key exists
SELECT * FROM campaigns WHERE settings ? 'sendTime';

-- 3. Check if key-value exists
SELECT * FROM campaigns WHERE settings @> '{"trackingEnabled": true}';

-- 4. Index JSONB field (GIN index)
CREATE INDEX idx_campaigns_settings ON campaigns USING GIN (settings);

-- 5. Query nested array
SELECT * FROM campaigns WHERE settings->'tags' @> '["newsletter"]';

-- ❌ BAD: Don't use JSONB for frequently queried relational data
@Entity('campaigns')
export class Campaign {
  @Column({ type: 'jsonb' })
  userId: string; // ❌ Should be foreign key column
}
```

---

## 🔒 CONSTRAINTS & INDEXES

### **1. Primary Keys**

```typescript
// ✅ GOOD: UUID primary key (preferred for distributed systems)
@PrimaryGeneratedColumn('uuid')
id: string;

// ✅ ACCEPTABLE: Auto-increment integer (for simple setups)
@PrimaryGeneratedColumn('increment')
id: number;

-- UUID generation in PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Default to gen_random_uuid() (PostgreSQL 13+)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

-- ❌ BAD: Don't use sequential UUIDs (UUIDv1) - leaks information
-- Use UUIDv4 (gen_random_uuid) or UUIDv7 (time-ordered)
```

---

### **2. Foreign Keys**

```typescript
// ✅ GOOD: Explicit foreign keys with indexes
@Entity('orders')
export class Order extends TenantEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'product_id' })
  productId: string;

  // Relation
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.orders)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

-- PostgreSQL foreign key with index
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Index foreign keys automatically
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
```

---

### **3. Check Constraints**

```sql
-- ✅ GOOD: Check constraints for data validation
ALTER TABLE users 
  ADD CONSTRAINT chk_users_email 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE campaigns 
  ADD CONSTRAINT chk_campaigns_budget 
  CHECK (budget >= 0);

ALTER TABLE orders 
  ADD CONSTRAINT chk_orders_quantity 
  CHECK (quantity > 0);

ALTER TABLE products 
  ADD CONSTRAINT chk_products_price 
  CHECK (price >= 0);

-- Check constraint for enum
ALTER TABLE campaigns 
  ADD CONSTRAINT chk_campaigns_status 
  CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed'));
```

---

### **4. Unique Constraints**

```typescript
// ✅ GOOD: Composite unique constraints
@Entity('user_roles')
@Unique(['userId', 'role']) // Composite unique
export class UserRole {
  @Column()
  userId: string;

  @Column()
  role: string;
}

@Entity('campaigns')
@Unique(['tenantId', 'name']) // Unique per tenant
export class Campaign extends TenantEntity {
  @Column()
  name: string;
}

-- PostgreSQL
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL,
  UNIQUE(user_id, role)
);

CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  UNIQUE(tenant_id, name)
);
```

---

### **5. Indexing Strategy**

```typescript
// Index types and when to use:

// 1. B-tree (default) - equality and range queries
@Entity('users')
@Index(['email']) // Single column
@Index(['tenantId', 'createdAt']) // Composite
export class User {
  @Column()
  email: string;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

-- PostgreSQL
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_created ON users(tenant_id, created_at);

-- 2. GIN index - JSONB, arrays, full-text search
CREATE INDEX idx_campaigns_settings ON campaigns USING GIN (settings);
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);

-- 3. GIST index - geometric data, full-text search
CREATE INDEX idx_locations_coords ON locations USING GIST (coordinates);

-- 4. BRIN index - large tables with natural ordering (time-series)
CREATE INDEX idx_logs_timestamp ON logs USING BRIN (timestamp);

-- 5. Partial index - index subset of rows
CREATE INDEX idx_active_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_running ON campaigns(tenant_id) WHERE status = 'running';

-- 6. Expression index - index on expression/function
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
CREATE INDEX idx_users_search ON users USING GIN (to_tsvector('english', name || ' ' || email));
```

---

### **6. Index Best Practices**

```typescript
// ✅ GOOD: Indexes for frequently queried columns
@Entity('campaigns')
@Index(['tenantId', 'status']) // Common filter
@Index(['tenantId', 'createdAt']) // Common sort
@Index(['tenantId', 'name']) // Search
@Index(['scheduledAt']) // Time-based queries
export class Campaign extends TenantEntity {
  @Column()
  tenantId: string;

  @Column()
  status: string;

  @Column()
  name: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;
}

// Index guidelines:
// 1. Index foreign keys (always)
// 2. Index frequently filtered columns
// 3. Index columns used in ORDER BY
// 4. Index columns used in JOIN
// 5. Use composite indexes for multi-column queries
// 6. Use partial indexes for filtered queries
// 7. Avoid over-indexing (slows down writes)

-- ❌ BAD: Don't index low-cardinality columns
CREATE INDEX idx_users_is_active ON users(is_active); -- Only true/false, not useful
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### **1. Query Optimization**

```typescript
// ❌ BAD: N+1 query problem
const campaigns = await this.campaignRepository.find();
for (const campaign of campaigns) {
  campaign.user = await this.userRepository.findById(campaign.userId); // N+1!
}

// ✅ GOOD: Use joins
const campaigns = await this.campaignRepository.find({
  relations: ['user', 'campaignTags', 'tags'],
});

// ✅ BETTER: Use query builder for complex queries
const campaigns = await this.campaignRepository
  .createQueryBuilder('campaign')
  .leftJoinAndSelect('campaign.user', 'user')
  .leftJoinAndSelect('campaign.campaignTags', 'campaignTag')
  .leftJoinAndSelect('campaignTag.tag', 'tag')
  .where('campaign.tenantId = :tenantId', { tenantId })
  .andWhere('campaign.status = :status', { status: 'ACTIVE' })
  .orderBy('campaign.createdAt', 'DESC')
  .skip(0)
  .take(20)
  .getMany();

-- ✅ BEST: Use SELECT only what you need
const campaigns = await this.campaignRepository
  .createQueryBuilder('campaign')
  .select(['campaign.id', 'campaign.name', 'campaign.status', 'user.email'])
  .leftJoin('campaign.user', 'user')
  .where('campaign.tenantId = :tenantId', { tenantId })
  .getMany();
```

---

### **2. Pagination**

```typescript
// ✅ GOOD: Keyset pagination (preferred for large datasets)
async function findCampaignsAfter(tenantId: string, lastId: string, limit: number) {
  return this.campaignRepository
    .createQueryBuilder('campaign')
    .where('campaign.tenantId = :tenantId', { tenantId })
    .andWhere('campaign.id > :lastId', { lastId })
    .orderBy('campaign.id', 'ASC')
    .limit(limit)
    .getMany();
}

// Usage
let lastId = '';
while (true) {
  const campaigns = await service.findCampaignsAfter(tenantId, lastId, 100);
  if (campaigns.length === 0) break;
  
  // Process campaigns
  lastId = campaigns[campaigns.length - 1].id;
}

-- ✅ ACCEPTABLE: Offset pagination (for small datasets)
SELECT * FROM campaigns 
WHERE tenant_id = 'abc123'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- ❌ BAD: Large offsets are slow
SELECT * FROM campaigns LIMIT 20 OFFSET 100000; -- Very slow!
```

---

### **3. Connection Pooling**

```typescript
// database.config.ts
import { DataSource, DataSourceOptions } from 'typeorm';

export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Connection pool settings
  extra: {
    max: 20, // Maximum connections
    min: 5, // Minimum connections
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Error if connection takes >2s
  },

  // Other settings
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // NEVER use in production
  logging: process.env.NODE_ENV === 'development',
  maxQueryExecutionTime: 1000, // Log slow queries (>1s)
};

-- PostgreSQL configuration (postgresql.conf)
-- Connection settings
max_connections = 200
shared_buffers = 4GB
work_mem = 64MB
maintenance_work_mem = 512MB

-- Connection pooling (pgBouncer recommended)
-- See: https://www.pgbouncer.org/
```

---

### **4. Materialized Views**

```sql
-- ✅ GOOD: Materialized views for expensive aggregations
CREATE MATERIALIZED VIEW campaign_stats AS
SELECT 
  c.id AS campaign_id,
  c.name AS campaign_name,
  COUNT(DISTINCT e.id) AS emails_sent,
  COUNT(DISTINCT o.id) AS opens,
  COUNT(DISTINCT cl.id) AS clicks,
  COUNT(DISTINCT b.id) AS bounces,
  COUNT(DISTINCT u.id) AS unsubscribes,
  ROUND(COUNT(DISTINCT o.id)::numeric / NULLIF(COUNT(DISTINCT e.id), 0) * 100, 2) AS open_rate,
  ROUND(COUNT(DISTINCT cl.id)::numeric / NULLIF(COUNT(DISTINCT e.id), 0) * 100, 2) AS click_rate
FROM campaigns c
LEFT JOIN email_logs e ON e.campaign_id = c.id
LEFT JOIN opens o ON o.email_log_id = e.id
LEFT JOIN clicks cl ON cl.email_log_id = e.id
LEFT JOIN bounces b ON b.email_log_id = e.id
LEFT JOIN unsubscribes u ON u.email_log_id = e.id
GROUP BY c.id, c.name;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW campaign_stats;

-- Create index on materialized view
CREATE INDEX idx_campaign_stats_campaign_id ON campaign_stats(campaign_id);

-- Query materialized view (fast!)
SELECT * FROM campaign_stats WHERE campaign_id = 'abc123';
```

---

## 🔐 SECURITY STANDARDS

### **1. Row Level Security (RLS)**

```sql
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policy for users table
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.current_tenant_id'));

-- Create policy for campaigns table
CREATE POLICY tenant_isolation_campaigns ON campaigns
  USING (tenant_id = current_setting('app.current_tenant_id'));

-- Admin policy (can see all tenants)
CREATE POLICY admin_override ON users
  USING (current_setting('app.current_user_role') = 'admin');

-- Set tenant context (in application)
SET app.current_tenant_id = 'tenant_abc123';
SET app.current_user_id = 'user_123';
SET app.current_user_role = 'member';

-- Now queries automatically filter by tenant
SELECT * FROM users; -- Only returns users for tenant_abc123
```

---

### **2. Data Encryption**

```typescript
// Application-level encryption for sensitive data
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

  encrypt(plaintext: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return { encrypted, iv: iv.toString('hex'), authTag: authTag.toString('hex') };
  }

  decrypt(data: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(data.iv, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
    
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

-- PostgreSQL encryption (pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt data
INSERT INTO users (email, encrypted_ssn)
VALUES ('user@example.com', pgp_sym_encrypt('123-45-6789', 'encryption_key'));

-- Decrypt data
SELECT email, pgp_sym_decrypt(encrypted_ssn, 'encryption_key') AS ssn FROM users;
```

---

### **3. Access Control**

```sql
-- Create read-only user
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE mixer_production TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;

-- Create application user (limited privileges)
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE mixer_production TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Revoke dangerous privileges
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE mixer_production FROM PUBLIC;
```

---

## 💾 BACKUP & RECOVERY

### **1. Backup Strategy**

```yaml
Backup Strategy:

1. **Continuous Archiving (WAL)**:
   - Archive WAL (Write-Ahead Log) continuously
   - Allows point-in-time recovery (PITR)
   - Retention: 7 days

2. **Daily Full Backups**:
   - pg_dump or pg_basebackup
   - Compressed and encrypted
   - Retention: 30 days
   - Schedule: 2 AM UTC (low traffic)

3. **Weekly Full Backups**:
   - Full database backup
   - Retention: 90 days

4. **Monthly Backups**:
   - Full database backup
   - Retention: 1 year
   - Archive to cold storage (S3 Glacier)

5. **Schema-Only Backups** (Multi-tenancy):
   - Export schema definitions
   - Retention: Indefinitely
```

---

### **2. Backup Scripts**

```bash
#!/bin/bash
# scripts/backup.sh

# Configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mixer_production"
DB_USER="postgres"
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Full backup with compression
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -F c -b -v \
  -f "$BACKUP_DIR/full_backup_$DATE.dump"

# Encrypt backup
gpg --symmetric --cipher-algo AES256 \
  "$BACKUP_DIR/full_backup_$DATE.dump"

# Remove unencrypted backup
rm "$BACKUP_DIR/full_backup_$DATE.dump"

# Delete old backups
find $BACKUP_DIR -name "*.gpg" -type f -mtime +$RETENTION_DAYS -delete

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/full_backup_$DATE.gpg" s3://mixer-backups/postgresql/

echo "Backup completed: full_backup_$DATE.gpg"
```

---

### **3. Point-in-Time Recovery (PITR)**

```sql
-- Configure WAL archiving
-- postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /archive/%f'
max_wal_size = 4GB
min_wal_size = 1GB

-- Restore to specific point in time
-- 1. Restore base backup
-- 2. Create recovery.conf
restore_command = 'cp /archive/%f %p'
recovery_target_time = '2026-09-07 14:30:00'
recovery_target_action = 'promote'

-- 3. Start PostgreSQL
-- It will recover to the specified time
```

---

## 📈 MONITORING & MAINTENANCE

### **1. Essential Metrics**

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('mixer_production'));

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Active connections
SELECT 
  datname,
  count(*) AS connection_count,
  state,
  wait_event_type,
  wait_event
FROM pg_stat_activity
GROUP BY datname, state, wait_event_type, wait_event
ORDER BY datname;

-- Cache hit ratio (should be >99%)
SELECT 
  sum(heap_blks_read) AS heap_read,
  sum(heap_blks_hit) AS heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS ratio
FROM pg_statio_user_tables;
```

---

### **2. Maintenance Tasks**

```sql
-- 1. VACUUM (reclaim storage)
VACUUM VERBOSE users; -- Vacuum specific table
VACUUM FULL users; -- Full vacuum (locks table, use during maintenance)
VACUUM ANALYZE users; -- Vacuum + update statistics

-- 2. ANALYZE (update statistics)
ANALYZE users;
ANALYZE VERBOSE users;

-- 3. REINDEX (rebuild indexes)
REINDEX INDEX idx_users_email;
REINDEX TABLE users;

-- 4. Cluster (reorder table by index)
CLUSTER users USING idx_users_created_at;

-- 5. Check constraints
SELECT conname, contype, conrelid::regclass 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass;

-- 6. Check for bloat
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS index_size,
  n_dead_tup,
  last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

---

### **3. Automated Maintenance (pg_cron)**

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily VACUUM ANALYZE at 2 AM
SELECT cron.schedule('daily-vacuum', '0 2 * * *', 
  'VACUUM ANALYZE;');

-- Weekly REINDEX on Sunday at 3 AM
SELECT cron.schedule('weekly-reindex', '0 3 * * 0',
  'REINDEX DATABASE mixer_production;');

-- Monthly statistics reset
SELECT cron.schedule('monthly-stats-reset', '0 4 1 * *',
  'SELECT pg_stat_reset();');

-- View scheduled jobs
SELECT * FROM cron.job;
```

---

## 🔄 MIGRATION STANDARDS

### **1. Migration File Naming**

```
-- ✅ GOOD: Timestamp + descriptive name
20260907120000-create-users-table.ts
20260907130000-create-campaigns-table.ts
20260907140000-add-tenant-id-to-users.ts
20260907150000-create-audit-logs-table.ts

-- ❌ BAD
1-initial.ts
migration.ts
add-column.ts
```

---

### **2. Migration Template**

```typescript
// migrations/20260907120000-create-users-table.ts
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersTable20260907120000 implements MigrationInterface {
  name = 'CreateUsersTable20260907120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true, // ifNotExists
    );

    // Create indexes
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'users',
      {
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      },
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('users', 'idx_users_tenant_id');
    await queryRunner.dropIndex('users', 'idx_users_email');

    // Drop table
    await queryRunner.dropTable('users');
  }
}
```

---

### **3. Migration Best Practices**

```typescript
// ✅ GOOD: Migrations are reversible
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE users ADD COLUMN email VARCHAR(255)`);
  await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.dropIndex('users', 'idx_users_email');
  await queryRunner.query(`ALTER TABLE users DROP COLUMN email`);
}

-- ✅ GOOD: Migrations are idempotent (can run multiple times)
await queryRunner.query(`
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
`);

-- ✅ GOOD: Migrations are atomic (single transaction)
await queryRunner.startTransaction();
try {
  await queryRunner.query(`ALTER TABLE ...`);
  await queryRunner.query(`CREATE INDEX ...`);
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
}

-- ❌ BAD: Don't use synchronize in production
// TypeORM synchronize should NEVER be used in production
// Always use migrations

-- ❌ BAD: Don't modify data in migrations
// Migrations should only modify schema, not data
// Use seeders for data migration
```

---

## 🔍 QUERY STANDARDS

### **1. Query Best Practices**

```typescript
// ✅ GOOD: Use parameterized queries (prevents SQL injection)
const user = await this.userRepository
  .createQueryBuilder('user')
  .where('user.email = :email', { email: userEmail })
  .getOne();

-- ✅ GOOD: Use prepared statements
PREPARE get_user (varchar) AS
  SELECT * FROM users WHERE email = $1;

EXECUTE get_user('user@example.com');

-- ❌ BAD: String concatenation (SQL injection vulnerability!)
const email = req.body.email;
const user = await query(`SELECT * FROM users WHERE email = '${email}'`);

-- ✅ GOOD: Use transactions for multiple queries
const queryRunner = this.connection.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  await queryRunner.manager.save(user);
  await queryRunner.manager.save(profile);
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

---

### **2. Avoid Common Pitfalls**

```typescript
// ❌ BAD: SELECT *
const users = await this.userRepository.find();
// Loads all columns including large text fields

// ✅ GOOD: Select specific columns
const users = await this.userRepository
  .createQueryBuilder('user')
  .select(['user.id', 'user.email', 'user.name'])
  .getMany();

-- ❌ BAD: Using DISTINCT when not needed
SELECT DISTINCT * FROM users WHERE email = 'user@example.com';

-- ✅ GOOD: Use DISTINCT only when necessary
SELECT DISTINCT user_id FROM orders WHERE status = 'completed';

-- ❌ BAD: Using subqueries when JOINs work
SELECT * FROM users 
WHERE id IN (SELECT user_id FROM orders WHERE total > 100);

-- ✅ GOOD: Use JOINs
SELECT u.* FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.total > 100;

-- ❌ BAD: NOT IN with NULL values
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders);

-- ✅ GOOD: Use NOT EXISTS
SELECT * FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

---

## 🏔️ HIGH AVAILABILITY

### **1. Streaming Replication**

```sql
-- Primary Server (postgresql.conf)
wal_level = replica
max_wal_senders = 10
wal_keep_size = 1GB
hot_standby = on

-- Primary Server (pg_hba.conf)
host replication replicator 10.0.0.0/24 scram-sha-256

-- Create replication user
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'secure_password';

-- Standby Server (postgresql.conf)
primary_conninfo = 'host=primary-host port=5432 user=replicator password=secure_password dbname=mixer_production'
hot_standby = on

-- Start standby
pg_basebackup -h primary-host -D /var/lib/postgresql/data -U replicator -P -R

-- Check replication status
SELECT * FROM pg_stat_replication;
```

---

### **2. Automatic Failover**

```yaml
# Patroni Configuration (for automatic failover)
scope: mixer
namespace: /service/
name: node1

restapi:
  listen: 0.0.0.0:8008
  connect_address: 10.0.0.1:8008

etcd:
  hosts: 10.0.0.1:2379,10.0.0.2:2379,10.0.0.3:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true
      parameters:
        max_connections: 200
        max_wal_senders: 10
        wal_level: replica
        hot_standby: "on"

postgresql:
  listen: 0.0.0.0:5432
  connect_address: 10.0.0.1:5432
  data_dir: /var/lib/postgresql/data
  authentication:
    replication:
      username: replicator
      password: secure_password
    superuser:
      username: postgres
      password: secure_password
    rewind:
      username: rewind_user
      password: secure_password
```

---

## 📚 OFFICIAL REFERENCES

### **Official Documentation**
- **PostgreSQL Official Docs**: https://www.postgresql.org/docs/
- **PostgreSQL 15 Documentation**: https://www.postgresql.org/docs/15/
- **PostgreSQL Wiki**: https://wiki.postgresql.org/
- **Planet PostgreSQL**: https://planet.postgresql.org/

### **Performance & Optimization**
- **PostgreSQL Performance Tips**: https://wiki.postgresql.org/wiki/Performance_Optimization
- **Use The Index, Luke**: https://use-the-index-luke.com/
- **PostgreSQL EXPLAIN**: https://www.postgresql.org/docs/15/using-explain.html
- **pg_stat_statements**: https://www.postgresql.org/docs/15/pgstatstatements.html

### **Security**
- **PostgreSQL Security**: https://www.postgresql.org/docs/15/sql-syntax.html#SQL-SECURITY
- **Row Level Security**: https://www.postgresql.org/docs/15/ddl-rowsecurity.html
- **pgcrypto Extension**: https://www.postgresql.org/docs/15/pgcrypto.html

### **High Availability**
- **Streaming Replication**: https://www.postgresql.org/docs/15/warm-standby.html
- **Patroni**: https://patroni.readthedocs.io/
- **pg_basebackup**: https://www.postgresql.org/docs/15/app-pgbasebackup.html

### **Monitoring**
- **pg_stat_statements**: https://www.postgresql.org/docs/15/pgstatstatements.html
- **pg_stat_activity**: https://www.postgresql.org/docs/15/monitoring-stats.html
- **pgBadger**: https://pgbadger.darold.net/

### **Tools & Extensions**
- **pgBouncer**: https://www.pgbouncer.org/
- **pg_stat_statements**: https://www.postgresql.org/docs/15/pgstatstatements.html
- **pgcrypto**: https://www.postgresql.org/docs/15/pgcrypto.html
- **pg_partman**: https://github.com/pgpartman/pg_partman
- **pgvector**: https://github.com/pgvector/pgvector

### **Books**
1. **"PostgreSQL: Up and Running"** - Regina Obe & Leo Hsu
2. **"Mastering PostgreSQL in Application Development"** - Dimitri Fontaine
3. **"High Performance PostgreSQL"** - Greg Smith
4. **"The Art of PostgreSQL"** - Dimitri Fontaine

### **Blogs & Tutorials**
- **PostgreSQL Blog**: https://www.postgresql.org/about/news/
- **Cybertec PostgreSQL Blog**: https://www.cybertec-postgresql.com/en/blog/
- **Percona Database Blog**: https://www.percona.com/blog/
- **Craig Kerstiens**: https://www.craigkerstiens.com/

---

## ✅ POSTGRESQL QUALITY CHECKLIST

### **Schema Design**
- [ ] All tables have primary keys
- [ ] Foreign keys defined with indexes
- [ ] Check constraints for data validation
- [ ] ENUM types for fixed value sets
- [ ] JSONB for flexible schema
- [ ] Proper data types (UUID, TIMESTAMP, etc.)

### **Performance**
- [ ] Indexes on foreign keys
- [ ] Indexes on frequently queried columns
- [ ] Indexes on ORDER BY columns
- [ ] Partial indexes where appropriate
- [ ] No N+1 queries
- [ ] Pagination implemented
- [ ] Connection pooling configured
- [ ] Slow query log enabled

### **Security**
- [ ] Row Level Security enabled
- [ ] Application user has minimal privileges
- [ ] Read-only user for reporting
- [ ] Encryption at rest (disk encryption)
- [ ] Encryption in transit (TLS/SSL)
- [ ] Audit logging enabled
- [ ] Sensitive data encrypted (pgcrypto)

### **Backup & Recovery**
- [ ] Daily automated backups
- [ ] WAL archiving enabled
- [ ] Backup retention policy (30+ days)
- [ ] Backup encryption
- [ ] Offsite backup storage
- [ ] Recovery tested monthly
- [ ] Point-in-time recovery configured

### **Monitoring**
- [ ] Slow query log enabled
- [ ] pg_stat_statements installed
- [ ] Connection monitoring
- [ ] Disk space monitoring
- [ ] Replication monitoring (if applicable)
- [ ] Alerts configured for critical metrics

### **High Availability**
- [ ] Streaming replication configured
- [ ] Automatic failover (Patroni)
- [ ] Load balancer configured
- [ ] Read replicas for reporting
- [ ] Backup verification

---

**Standard ini menjamin Mixer menggunakan PostgreSQL dengan best practices untuk performance, security, scalability, dan reliability.**

*Version: 1.0 | 2026-09-07 | Maintained by: Database Administrator & Tech Lead*