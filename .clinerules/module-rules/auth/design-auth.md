# Authentication & Authorization Module - Technical Design Document

**Project**: Mixer - Marketing Automation Platform  
**Module**: Authentication & Authorization (Auth Module)  
**Version**: 1.0.0  
**Date**: 2026-09-07  
**Status**: Draft  
**Author**: Mixer Development Team  

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Module Structure](#module-structure)
3. [Database Design](#database-design)
4. [API Design](#api-design)
5. [Security Design](#security-design)
6. [Implementation Details](#implementation-details)
7. [Integration Points](#integration-points)
8. [Error Handling](#error-handling)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│  (Web App / Mobile App / API Consumers)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway / Load Balancer             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    NestJS Application Layer                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Auth Module                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │ Controllers  │  │  Services   │  │   Guards     │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │   DTOs      │  │  Entities   │  │ Strategies   │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Users Module                              │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   PostgreSQL │  │    Redis     │  │   Email Service │  │
│  │  (Primary)   │  │  (Optional)  │  │  (SMTP/SendGrid)│  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles

- **Separation of Concerns**: Clear separation between controllers, services, and data access
- **Single Responsibility**: Each class has one reason to change
- **Dependency Injection**: Use NestJS DI container for loose coupling
- **Interface-Based Design**: Use interfaces for contracts between layers
- **DTO Validation**: Validate all inputs at the boundary
- **Error Handling**: Centralized exception handling
- **Security First**: Implement security best practices by default

---

## 2. Module Structure

### 2.1 Directory Structure

```
apps/backend/src/
├── modules/
│   └── auth/
│       ├── auth.module.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       │
│       ├── dto/
│       │   ├── register.dto.ts
│       │   ├── login.dto.ts
│       │   ├── refresh-token.dto.ts
│       │   ├── forgot-password.dto.ts
│       │   ├── reset-password.dto.ts
│       │   ├── change-password.dto.ts
│       │   ├── verify-email.dto.ts
│       │   └── resend-verification.dto.ts
│       │
│       ├── entities/
│       │   ├── user.entity.ts
│       │   ├── refresh-token.entity.ts
│       │   ├── session.entity.ts
│       │   └── password-history.entity.ts
│       │
│       ├── interfaces/
│       │   ├── user.interface.ts
│       │   ├── jwt-payload.interface.ts
│       │   └── auth-response.interface.ts
│       │
│       ├── strategies/
│       │   ├── jwt.strategy.ts
│       │   └── local.strategy.ts
│       │
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   ├── roles.guard.ts
│       │   └── permissions.guard.ts
│       │
│       ├── decorators/
│       │   ├── roles.decorator.ts
│       │   ├── current-user.decorator.ts
│       │   └── public.decorator.ts
│       │
│       ├── pipes/
│       │   └── password-strength.pipe.ts
│       │
│       ├── services/
│       │   ├── password.service.ts
│       │   ├── token.service.ts
│       │   ├── email.service.ts
│       │   └── session.service.ts
│       │
│       └── constants/
│           ├── roles.enum.ts
│           ├── error-codes.enum.ts
│           └── auth.config.ts
│
└── common/
    ├── filters/
    │   └── http-exception.filter.ts
    ├── interceptors/
    │   ├── transform.interceptor.ts
    │   └── logging.interceptor.ts
    ├── guards/
    │   └── throttle.guard.ts
    └── pipes/
        └── validation.pipe.ts
```

### 2.2 Module Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Auth Module                                │
│                                                               │
│  ┌─────────────┐                                            │
│  │ Controller   │ ← Public API Endpoints                     │
│  └──────┬──────┘                                            │
│         │ uses                                               │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │   Service    │ ← Business Logic                           │
│  └──────┬──────┘                                            │
│         │ uses                                               │
│    ┌────┴────────────────────────────┐                       │
│    │                                 │                       │
│    ▼                                 ▼                       │
│ ┌────────┐  ┌──────────┐  ┌────────────────┐               │
│ │Password │  │  Token   │  │     Email      │               │
│ │ Service │  │ Service  │  │    Service     │               │
│ └────────┘  └──────────┘  └────────────────┘               │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │         Data Access Layer (TypeORM)      │                │
│  │  ┌──────────┐  ┌──────────┐  ┌───────┐  │                │
│  │  │  User    │  │ Refresh  │  │Session│  │                │
│  │  │ Repository│ │ Token    │  │Repo   │  │                │
│  │  │          │  │ Repository│ │       │  │                │
│  │  └──────────┘  └──────────┘  └───────┘  │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Design

### 3.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          users                               │
├─────────────────────────────────────────────────────────────┤
│ id (PK) UUID                                                 │
│ email VARCHAR(255) UNIQUE NOT NULL                           │
│ password VARCHAR(255) NOT NULL                               │
│ name VARCHAR(100) NOT NULL                                   │
│ role VARCHAR(50) DEFAULT 'user'                              │
│ email_verified BOOLEAN DEFAULT FALSE                         │
│ email_verification_token VARCHAR(255)                        │
│ email_verification_expires TIMESTAMP                        │
│ password_reset_token VARCHAR(255)                            │
│ password_reset_expires TIMESTAMP                            │
│ failed_login_attempts INTEGER DEFAULT 0                      │
│ locked_until TIMESTAMP                                       │
│ last_login TIMESTAMP                                         │
│ created_at TIMESTAMP DEFAULT NOW()                           │
│ updated_at TIMESTAMP DEFAULT NOW()                           │
│ deleted_at TIMESTAMP                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1:N
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ refresh_tokens │  │    sessions   │  │password_history│
├───────────────┤  ├───────────────┤  ├───────────────┤
│ id (PK) UUID   │  │ id (PK) UUID  │  │ id (PK) UUID  │
│ user_id (FK)   │  │ user_id (FK)  │  │ user_id (FK)  │
│ token VARCHAR  │  │ ip_address    │  │ password_hash │
│ expires_at     │  │ user_agent    │  │ created_at    │
│ revoked BOOLEAN│  │ refresh_token │  │               │
│ created_at     │  │ expires_at    │  │               │
└───────────────┘  │ last_active   │  └───────────────┘
                    └───────────────┘
```

### 3.2 Entity Specifications

#### User Entity

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Session } from './session.entity';
import { PasswordHistory } from './password-history.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verification_token', length: 255, nullable: true })
  emailVerificationToken: string;

  @Column({ name: 'email_verification_expires', type: 'timestamp', nullable: true })
  emailVerificationExpires: Date;

  @Column({ name: 'password_reset_token', length: 255, nullable: true, unique: true })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => PasswordHistory, (history) => history.user)
  passwordHistory: PasswordHistory[];
}
```

#### RefreshToken Entity

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  token: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'revoked', default: false })
  revoked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

#### Session Entity

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ length: 255 })
  refreshToken: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'last_active', type: 'timestamp' })
  lastActive: Date;

  @ManyToOne(() => User, (user) => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

#### PasswordHistory Entity

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('password_history')
export class PasswordHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.passwordHistory)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### 3.3 Database Indexes

```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Refresh tokens indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Password history indexes
CREATE INDEX idx_password_history_user_id ON password_history(user_id);
CREATE INDEX idx_password_history_created_at ON password_history(created_at);
```

---

## 4. API Design

### 4.1 REST API Endpoints

#### Public Endpoints (No Authentication Required)

```
┌─────────┬──────────────────────────────────────┬───────────┬─────────────────────────────┐
│ Method  │ Endpoint                            │ Auth      │ Description                 │
├─────────┼──────────────────────────────────────┼───────────┼─────────────────────────────┤
│ POST    │ /api/v1/auth/register               │ Public    │ Register new user           │
│ POST    │ /api/v1/auth/login                  │ Public    │ Login user                  │
│ POST    │ /api/v1/auth/refresh                │ Public    │ Refresh access token        │
│ POST    │ /api/v1/auth/forgot-password        │ Public    │ Request password reset      │
│ POST    │ /api/v1/auth/reset-password         │ Public    │ Reset password with token   │
│ POST    │ /api/v1/auth/verify-email           │ Public    │ Verify email address        │
│ POST    │ /api/v1/auth/resend-verification    │ Public    │ Resend verification email   │
└─────────┴──────────────────────────────────────┴───────────┴─────────────────────────────┘
```

#### Protected Endpoints (Authentication Required)

```
┌─────────┬──────────────────────────────────────┬───────────┬─────────────────────────────┐
│ Method  │ Endpoint                            │ Auth      │ Description                 │
├─────────┼──────────────────────────────────────┼───────────┼─────────────────────────────┤
│ POST    │ /api/v1/auth/logout                 │ Required  │ Logout user                 │
│ POST    │ /api/v1/auth/logout-all             │ Required  │ Logout from all devices     │
│ POST    │ /api/v1/auth/change-password        │ Required  │ Change password             │
│ GET     │ /api/v1/auth/me                     │ Required  │ Get current user profile    │
│ GET     │ /api/v1/auth/sessions               │ Required  │ Get active sessions         │
│ DELETE  │ /api/v1/auth/sessions/:id           │ Required  │ Delete specific session     │
│ DELETE  │ /api/v1/auth/sessions               │ Required  │ Delete all sessions         │
└─────────┴──────────────────────────────────────┴───────────┴─────────────────────────────┘
```

### 4.2 Request/Response Specifications

#### POST /api/v1/auth/register

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Validation Rules:**
- `email`: Required, valid email format, max 255 characters
- `password`: Required, min 8 characters, must contain uppercase, lowercase, number, special char
- `name`: Required, min 2 characters, max 100 characters

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}

// 409 Conflict
{
  "success": false,
  "message": "Email already exists",
  "error": "EMAIL_EXISTS"
}
```

#### POST /api/v1/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "emailVerified": true,
      "lastLogin": "2026-09-07T10:30:00Z"
    }
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "success": false,
  "message": "Invalid credentials",
  "error": "INVALID_CREDENTIALS"
}

// 403 Forbidden - Account locked
{
  "success": false,
  "message": "Account locked. Try again in 15 minutes.",
  "error": "ACCOUNT_LOCKED",
  "lockedUntil": "2026-09-07T11:00:00Z"
}

// 403 Forbidden - Email not verified
{
  "success": false,
  "message": "Please verify your email before logging in",
  "error": "EMAIL_NOT_VERIFIED"
}
```

#### POST /api/v1/auth/refresh

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

#### POST /api/v1/auth/logout

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /api/v1/auth/me

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "emailVerified": true,
    "lastLogin": "2026-09-07T10:30:00Z",
    "createdAt": "2026-09-01T08:00:00Z"
  }
}
```

---

## 5. Security Design

### 5.1 Authentication Flow

```
┌──────────┐                           ┌──────────┐
│ Client   │                           │  Server  │
└─────┬────┘                           └─────┬────┘
      │                                      │
      │  1. POST /auth/login                 │
      │  {email, password}                   │
      ├─────────────────────────────────────>│
      │                                      │
      │                          2. Validate │
      │                          3. Check    │
      │                          4. Generate │
      │                          5. Store    │
      │                                      │
      │  6. Return tokens + user             │
      │<─────────────────────────────────────┤
      │                                      │
      │  7. Store refresh token locally      │
      │                                      │
      │  8. Request protected resource       │
      │  Authorization: Bearer <token>       │
      ├─────────────────────────────────────>│
      │                          9. Validate │
      │                          10. Return  │
      │<─────────────────────────────────────┤
      │                                      │
      │  11. Token expired                   │
      │  POST /auth/refresh                  │
      │  {refreshToken}                      │
      ├─────────────────────────────────────>│
      │                          12. Validate│
      │                          13. Rotate │
      │                          14. Return │
      │<─────────────────────────────────────┤
```

### 5.2 Password Hashing Strategy

```typescript
// Bcrypt configuration
const BCRYPT_ROUNDS = 10;
const SALT_LENGTH = 16;

// Hashing process
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  return bcrypt.hash(password, salt);
}

// Verification process
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Password requirements validation
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '@$!%*?&',
};
```

### 5.3 JWT Token Strategy

**Access Token:**
- Algorithm: HS256
- Expiry: 15 minutes
- Payload: `{ sub: userId, email: string, role: UserRole, iat: number, exp: number }`
- Secret: `JWT_SECRET` (min 32 characters)

**Refresh Token:**
- Algorithm: HS256
- Expiry: 7 days
- Payload: `{ sub: userId, type: 'refresh', iat: number, exp: number }`
- Secret: `JWT_REFRESH_SECRET` (min 32 characters, different from access token)
- Storage: Database (for revocation)

**Token Generation:**
```typescript
@Injectable()
export class TokenService {
  constructor(
    @Inject('JWT_CONFIG') private readonly jwtConfig: JwtModuleOptions,
  ) {}

  generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      secret: this.jwtConfig.secret,
      expiresIn: this.jwtConfig.expiresIn,
    });
  }

  generateRefreshToken(user: User): string {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };
    return this.jwtService.sign(payload, {
      secret: this.jwtConfig.refreshSecret,
      expiresIn: this.jwtConfig.refreshExpiresIn,
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.jwtConfig.secret,
    });
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.jwtConfig.refreshSecret,
    });
  }
}
```

### 5.4 Rate Limiting Strategy

```typescript
// Apply to specific routes using @Throttle() decorator

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  
  @Post('register')
  @Throttle(3, 3600000) // 3 requests per hour
  async register(@Body() dto: RegisterDto) {
    // Implementation
  }

  @Post('login')
  @Throttle(5, 900000) // 5 requests per 15 minutes
  async login(@Body() dto: LoginDto) {
    // Implementation
  }

  @Post('forgot-password')
  @Throttle(3, 3600000) // 3 requests per hour
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    // Implementation
  }
}
```

### 5.5 Account Lockout Mechanism

```typescript
export class AccountLockoutService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  async recordFailedAttempt(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    user.failedLoginAttempts += 1;
    
    if (user.failedLoginAttempts >= this.MAX_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
    }
    
    await this.userRepository.save(user);
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await this.userRepository.save(user);
  }

  isLocked(user: User): boolean {
    if (!user.lockedUntil) return false;
    return new Date() < user.lockedUntil;
  }
}
```

---

## 6. Implementation Details

### 6.1 Auth Service Implementation

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly sessionService: SessionService,
    private readonly accountLockoutService: AccountLockoutService,
  ) {}

  // ==================== REGISTRATION ====================

  async register(dto: RegisterDto): Promise<{ userId: string }> {
    // 1. Validate input (handled by DTO decorators)
    
    // 2. Check if email exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists', 'EMAIL_EXISTS');
    }

    // 3. Hash password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // 4. Create user
    const user = this.userRepository.create({
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
      name: dto.name.trim(),
      role: UserRole.USER,
      emailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // 5. Generate verification token
    const verificationToken = this.generateSecureToken();
    savedUser.emailVerificationToken = await this.passwordService.hash(verificationToken);
    savedUser.emailVerificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    );
    await this.userRepository.save(savedUser);

    // 6. Send verification email
    await this.emailService.sendVerificationEmail(savedUser.email, verificationToken);

    return { userId: savedUser.id };
  }

  // ==================== LOGIN ====================

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    // 1. Find user
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      // Don't reveal if email exists
      throw new UnauthorizedException('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // 2. Check if account is locked
    if (this.accountLockoutService.isLocked(user)) {
      throw new ForbiddenException(
        'Account locked. Try again later.',
        'ACCOUNT_LOCKED',
        { lockedUntil: user.lockedUntil }
      );
    }

    // 3. Verify password
    const isPasswordValid = await this.passwordService.verify(dto.password, user.password);
    if (!isPasswordValid) {
      await this.accountLockoutService.recordFailedAttempt(user.id);
      throw new UnauthorizedException('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // 4. Check if email is verified
    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
        'EMAIL_NOT_VERIFIED'
      );
    }

    // 5. Reset failed attempts
    await this.accountLockoutService.resetFailedAttempts(user.id);

    // 6. Generate tokens
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    // 7. Store refresh token
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: await this.passwordService.hash(refreshToken), // Hash before storing
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      revoked: false,
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    // 8. Create session
    await this.sessionService.create({
      userId: user.id,
      ipAddress,
      userAgent,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 9. Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // 10. Return response
    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
      },
    };
  }

  // ==================== TOKEN REFRESH ====================

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // 1. Verify refresh token
    let payload: JwtPayload;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // 2. Find refresh token in database
    const storedToken = await this.refreshTokenRepository.findValidToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // 3. Find user
    const user = await this.userRepository.findById(payload.sub);
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found', 'USER_NOT_FOUND');
    }

    // 4. Revoke old refresh token
    storedToken.revoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // 5. Generate new tokens
    const accessToken = this.tokenService.generateAccessToken(user);
    const newRefreshToken = this.tokenService.generateRefreshToken(user);

    // 6. Store new refresh token
    const newRefreshTokenEntity = this.refreshTokenRepository.create({
      token: await this.passwordService.hash(newRefreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
    });
    await this.refreshTokenRepository.save(newRefreshTokenEntity);

    // 7. Return response
    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  // ==================== LOGOUT ====================

  async logout(refreshToken: string): Promise<void> {
    // Revoke refresh token
    const storedToken = await this.refreshTokenRepository.findByToken(refreshToken);
    if (storedToken) {
      storedToken.revoked = true;
      await this.refreshTokenRepository.save(storedToken);
    }

    // Delete session
    await this.sessionService.deleteByRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    // Revoke all refresh tokens
    await this.refreshTokenRepository.revokeAllByUserId(userId);
    
    // Delete all sessions
    await this.sessionService.deleteAllByUserId(userId);
  }

  // ==================== PASSWORD RESET ====================

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    // Find user (don't reveal if exists)
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      return; // Return success anyway for security
    }

    // Generate reset token
    const resetToken = this.generateSecureToken();
    user.passwordResetToken = await this.passwordService.hash(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepository.save(user);

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    // Find user by reset token
    const user = await this.userRepository.findByPasswordResetToken(dto.token);
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token', 'INVALID_RESET_TOKEN');
    }

    // Verify reset token
    const isTokenValid = await this.passwordService.verify(
      dto.token,
      user.passwordResetToken
    );
    if (!isTokenValid) {
      throw new BadRequestException('Invalid reset token', 'INVALID_RESET_TOKEN');
    }

    // Validate new password
    await this.passwordService.validateStrength(dto.password);

    // Check password history
    const isPasswordUsed = await this.passwordService.isPasswordUsed(user.id, dto.password);
    if (isPasswordUsed) {
      throw new BadRequestException(
        'Password was used before. Please choose a different password.',
        'PASSWORD_REUSED'
      );
    }

    // Hash new password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Save to password history
    await this.userRepository.savePasswordHistory(user.id, user.password);

    // Update user password
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    // Revoke all sessions
    await this.logoutAll(user.id);

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(user.email);
  }

  // ==================== EMAIL VERIFICATION ====================

  async verifyEmail(token: string): Promise<void> {
    // Find all users with this token (hashed)
    const users = await this.userRepository.findByVerificationToken(token);
    
    for (const user of users) {
      const isTokenValid = await this.passwordService.verify(token, user.emailVerificationToken);
      if (isTokenValid && user.emailVerificationExpires > new Date()) {
        user.emailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await this.userRepository.save(user);
        
        // Send welcome email
        await this.emailService.sendWelcomeEmail(user.email);
      }
    }
  }

  async resendVerificationEmail(dto: ResendVerificationDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified', 'EMAIL_ALREADY_VERIFIED');
    }

    // Generate new token
    const verificationToken = this.generateSecureToken();
    user.emailVerificationToken = await this.passwordService.hash(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userRepository.save(user);
    await this.emailService.sendVerificationEmail(user.email, verificationToken);
  }

  // ==================== CHANGE PASSWORD ====================

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);

    // Verify current password
    const isCurrentPasswordValid = await this.passwordService.verify(
      dto.currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect', 'INCORRECT_PASSWORD');
    }

    // Validate new password
    await this.passwordService.validateStrength(dto.newPassword);

    // Check password history
    const isPasswordUsed = await this.passwordService.isPasswordUsed(userId, dto.newPassword);
    if (isPasswordUsed) {
      throw new BadRequestException(
        'Password was used before. Please choose a different password.',
        'PASSWORD_REUSED'
      );
    }

    // Save old password to history
    await this.userRepository.savePasswordHistory(userId, user.password);

    // Update password
    user.password = await this.passwordService.hash(dto.newPassword);
    await this.userRepository.save(user);

    // Revoke all sessions except current (optional)
    // await this.logoutAllExceptCurrent(userId, currentRefreshToken);

    // Send notification
    await this.emailService.sendPasswordChangedEmail(user.email);
  }

  // ==================== PROFILE ====================

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }
    
    // Return user without sensitive data
    const { password, emailVerificationToken, passwordResetToken, ...profile } = user;
    return profile;
  }

  // ==================== HELPERS ====================

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
```

### 6.2 JWT Strategy Implementation

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('JWT_CONFIG') private readonly jwtConfig: JwtModuleOptions,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findById(payload.sub);
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found', 'USER_NOT_FOUND');
    }
    return user;
  }
}
```

### 6.3 JWT Auth Guard Implementation

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### 6.4 Roles Guard Implementation

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required', 'AUTH_REQUIRED');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions', 'FORBIDDEN');
    }

    return true;
  }
}
```

### 6.5 Password Service Implementation

```typescript
@Injectable()
export class PasswordService {
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async validateStrength(password: string): Promise<void> {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join(', '), 'WEAK_PASSWORD');
    }
  }

  async isPasswordUsed(userId: string, password: string): Promise<boolean> {
    const passwordHistory = await this.userRepository.findPasswordHistory(userId, 5);
    
    for (const history of passwordHistory) {
      const isMatch = await bcrypt.compare(password, history.passwordHash);
      if (isMatch) {
        return true;
      }
    }

    return false;
  }
}
```

---

## 7. Integration Points

### 7.1 Email Service Integration

```typescript
@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your email - Mixer',
      template: 'verification',
      context: {
        name: email,
        verificationLink,
        expiresIn: '24 hours',
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password - Mixer',
      template: 'password-reset',
      context: {
        name: email,
        resetLink,
        expiresIn: '1 hour',
      },
    });
  }

  async sendWelcomeEmail(email: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Mixer!',
      template: 'welcome',
      context: {
        name: email,
        loginLink: `${process.env.APP_URL}/login`,
      },
    });
  }

  async sendPasswordChangedEmail(email: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your password has been changed',
      template: 'password-changed',
      context: {
        name: email,
        supportEmail: 'support@mixer.com',
      },
    });
  }
}
```

### 7.2 Frontend Integration Guide

**HTTP Client Setup (Axios Example):**

```typescript
// frontend/src/lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );
        
        localStorage.setItem('access_token', response.data.data.accessToken);
        localStorage.setItem('refresh_token', response.data.data.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

**Login Example:**

```typescript
// frontend/src/app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      localStorage.setItem('access_token', response.data.data.accessToken);
      localStorage.setItem('refresh_token', response.data.data.refreshToken);
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 7.3 Module Configuration

```typescript
// modules/auth/auth.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, Session, PasswordHistory]),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRY', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'),
          port: config.get('SMTP_PORT'),
          secure: false,
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: `"Mixer" <${config.get('SMTP_FROM')}>`,
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        ttl: config.get('AUTH_THROTTLE_TTL', 900000),
        limit: config.get('AUTH_THROTTLE_LIMIT', 5),
      }),
      inject: [ConfigService],
    }),
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    EmailService,
    SessionService,
    AccountLockoutService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    RolesGuard,
    // Repositories
    UserRepository,
    RefreshTokenRepository,
    SessionRepository,
  ],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
```

---

## 8. Error Handling

### 8.1 Exception Filters

```typescript
@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      success: false,
      message: typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || 'An error occurred',
      error: (exceptionResponse as any)?.error || this.getErrorCode(status),
      ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    };
    return errorCodes[status] || 'UNKNOWN_ERROR';
  }
}
```

### 8.2 Error Codes Reference

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| AUTH-001 | 400 | Invalid input data |
| AUTH-002 | 409 | Email already exists |
| AUTH-003 | 401 | Invalid credentials |
| AUTH-004 | 403 | Account locked |
| AUTH-005 | 403 | Email not verified |
| AUTH-006 | 401 | Invalid or expired token |
| AUTH-007 | 404 | User not found |
| AUTH-008 | 400 | Invalid or expired reset token |
| AUTH-009 | 429 | Rate limit exceeded |
| AUTH-010 | 500 | Internal server error |
| AUTH-011 | 400 | Weak password |
| AUTH-012 | 409 | Password was used before |

### 8.3 Global Exception Handling

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  app.setGlobalPrefix('api/v1');
  
  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Global interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor()
  );
  
  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
  });
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

---

## 9. Testing Strategy

### 9.1 Unit Test Structure

```
apps/backend/src/modules/auth/
├── __tests__/
│   ├── unit/
│   │   ├── auth.service.spec.ts
│   │   ├── password.service.spec.ts
│   │   ├── token.service.spec.ts
│   │   ├── email.service.spec.ts
│   │   └── account-lockout.service.spec.ts
│   │
│   ├── integration/
│   │   ├── auth.controller.spec.ts
│   │   ├── register.spec.ts
│   │   ├── login.spec.ts
│   │   ├── token-refresh.spec.ts
│   │   ├── password-reset.spec.ts
│   │   └── email-verification.spec.ts
│   │
│   └── e2e/
│       └── auth.e2e-spec.ts
```

### 9.2 Unit Test Example

```typescript
// __tests__/unit/auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            findByPasswordResetToken: jest.fn(),
            findPasswordHistory: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn(),
            verify: jest.fn(),
            validateStrength: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    userRepository = module.get(UserRepository);
    passwordService = module.get(PasswordService);
  });

  it('should register a new user', async () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hashed_password');

    const result = await service.register(registerDto);

    expect(result).toHaveProperty('userId');
    expect(userRepository.save).toHaveBeenCalled();
  });
});
```

### 9.3 Integration Test Example

```typescript
// __tests__/integration/register.spec.ts
describe('POST /auth/register', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule, TypeOrmModule.forRoot(testDbConfig)],
    }).compile();

    app = moduleRef.createNestApplication();
    authService = moduleRef.get<AuthService>(AuthService);
    
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.userId).toBeDefined();
      });
  });

  it('should reject duplicate email', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      })
      .send({
        email: 'test@example.com',
        password: 'AnotherPass123!',
        name: 'Test User 2',
      })
      .expect(409);
  });
});
```

---

## 10. Deployment

### 10.1 Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<SECRET_3ac9e341>ASSWORD
DB_NAME=mixer

# JWT
JWT_SECRET=<SECRET_3ac9e341>t-minimum-32-characters-change-in-production
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=<SECRET_3ac9e341>t-secret-key-change-in-production
JWT_REFRESH_EXPIRY=7d

# Email (SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<SECRET_3ac9e341>grid-api-key
SMTP_FROM=noreply@mixer.com

# Email (SendGrid alternative)
SENDGRID_API_KEY=<SECRET_3ac9e341>ndgrid-api-key

# App URLs
APP_URL=https://app.mixer.com
API_URL=https://api.mixer.com/api/v1

# Rate Limiting
AUTH_THROTTLE_TTL=900000
AUTH_THROTTLE_LIMIT=5

# CORS
ALLOWED_ORIGINS=https://app.mixer.com,https://admin.mixer.com

# Security
BCRYPT_ROUNDS=10
```

### 10.2 Database Migration Script

```typescript
// migrations/1699358400000-CreateAuthTables.ts
import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateAuthTables1699358400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
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
          { name: 'email', type: 'varchar', length: '255', isUnique: true, isNullable: false },
          { name: 'password', type: 'varchar', length: '255', isNullable: false },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            default: "'user'",
            isNullable: false,
          },
          { name: 'email_verified', type: 'boolean', default: false },
          { name: 'email_verification_token', type: 'varchar', length: '255', isNullable: true },
          { name: 'email_verification_expires', type: 'timestamp', isNullable: true },
          { name: 'password_reset_token', type: 'varchar', length: '255', isUnique: true, isNullable: true },
          { name: 'password_reset_expires', type: 'timestamp', isNullable: true },
          { name: 'failed_login_attempts', type: 'integer', default: 0 },
          { name: 'locked_until', type: 'timestamp', isNullable: true },
          { name: 'last_login', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true
    );

    // Indexes
    await queryRunner.createIndex(
      'users',
      new Index('idx_users_email', ['email'])
    );
    await queryRunner.createIndex(
      'users',
      new Index('idx_users_email_verified', ['email_verified'])
    );

    // Refresh tokens table
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'token', type: 'varchar', length: '255', isUnique: true, isNullable: false },
          { name: 'expires_at', type: 'timestamp', isNullable: false },
          { name: 'revoked', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // Sessions table
    await queryRunner.createTable(
      new Table({
        name: 'sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'ip_address', type: 'varchar', length: '45', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'refresh_token', type: 'varchar', length: '255', isUnique: true, isNullable: false },
          { name: 'expires_at', type: 'timestamp', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'last_active', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // Password history table
    await queryRunner.createTable(
      new Table({
        name: 'password_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'password_hash', type: 'varchar', length: '255', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('password_history');
    await queryRunner.dropTable('sessions');
    await queryRunner.dropTable('refresh_tokens');
    await queryRunner.dropTable('users');
  }
}
```

### 10.3 Docker Configuration

```dockerfile
# Dockerfile (production)
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml (database)
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: mixer-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: <SECRET_3ac9e341>ord
      POSTGRES_DB: mixer
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - mixer-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: mixer-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - mixer-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  mixer-network:
    driver: bridge
```

---

## 11. Performance Optimization

### 11.1 Database Query Optimization

```typescript
// Use joins to avoid N+1 queries
async function findUserWithTokens(userId: string): Promise<User> {
  return this.userRepository.findOne({
    where: { id: userId },
    relations: ['refreshTokens', 'sessions'],
  });
}

// Use query builder for complex queries
async function findActiveSessions(userId: string): Promise<Session[]> {
  return this.sessionRepository
    .createQueryBuilder('session')
    .where('session.user_id = :userId', { userId })
    .andWhere('session.expires_at > NOW()')
    .orderBy('session.last_active', 'DESC')
    .take(10)
    .getMany();
}
```

### 11.2 Caching Strategy

```typescript
@Injectable()
export class UserCacheService {
  constructor(
    @Inject('REDIS') private readonly redis: Redis,
    private readonly userRepository: UserRepository,
  ) {}

  async getUser(userId: string): Promise<User> {
    const cacheKey = `user:${userId}`;
    
    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const user = await this.userRepository.findById(userId);
    if (user) {
      // Cache for 5 minutes
      await this.redis.setEx(cacheKey, 300, JSON.stringify(user));
    }

    return user;
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.redis.del(`user:${userId}`);
  }
}
```

### 11.3 Connection Pooling

```typescript
// database.config.ts
@Module({
  providers: [
    {
      provide: 'DATABASE_CONFIG',
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations in production
        logging: config.get('NODE_ENV') === 'development',
        max: 20, // Maximum pool size
        min: 5, // Minimum pool size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }),
      inject: [ConfigService],
    },
  ],
})
export class DatabaseConfigModule {}
```

---

## 12. Monitoring & Observability

### 12.1 Metrics to Track

```typescript
@Injectable()
export class AuthMetricsService {
  constructor(
    @Inject('PROMETHEUS') private readonly prometheus: PrometheusService,
  ) {}

  recordLoginAttempt(success: boolean): void {
    this.prometheus.histogram('auth_login_duration_seconds', {
      success,
    }).observe(1);
  }

  recordTokenRefresh(success: boolean): void {
    this.prometheus.counter('auth_token_refresh_total', {
      success: success ? '1' : '0',
    }).inc();
  }

  recordRegistration(): void {
    this.prometheus.counter('auth_registration_total').inc();
  }

  recordPasswordReset(): void {
    this.prometheus.counter('auth_password_reset_total').inc();
  }
}
```

### 12.2 Logging Strategy

```typescript
@Injectable()
export class AuthLoggingService {
  private readonly logger = new Logger(AuthLoggingService.name);

  logRegistration(userId: string, email: string): void {
    this.logger.log({
      event: 'USER_REGISTRATION',
      userId,
      email,
      timestamp: new Date().toISOString(),
    });
  }

  logLogin(userId: string, success: boolean, ipAddress?: string): void {
    this.logger.log({
      event: success ? 'USER_LOGIN_SUCCESS' : 'USER_LOGIN_FAILURE',
      userId,
      ipAddress,
      timestamp: new Date().toISOString(),
    });
  }

  logPasswordReset(email: string): void {
    this.logger.log({
      event: 'PASSWORD_RESET_REQUESTED',
      email,
      timestamp: new Date().toISOString(),
    });
  }

  logAccountLocked(userId: string, lockedUntil: Date): void {
    this.logger.warn({
      event: 'ACCOUNT_LOCKED',
      userId,
      lockedUntil: lockedUntil.toISOString(),
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 13. Security Checklist

### Pre-Deployment Security Checklist

- [ ] JWT secrets are at least 32 characters and stored securely
- [ ] All passwords are hashed with bcrypt (rounds >= 10)
- [ ] HTTPS is enforced for all endpoints
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled on all auth endpoints
- [ ] Account lockout mechanism is implemented
- [ ] Password strength validation is enforced
- [ ] Password history is maintained (last 5 passwords)
- [ ] Refresh tokens are rotated on each use
- [ ] Email verification is required before login
- [ ] Password reset tokens expire in 1 hour
- [ ] Sensitive data is not logged
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection (if using cookies)
- [ ] Security headers are set (Helmet.js)
- [ ] Database indexes are optimized
- [ ] Error messages don't reveal sensitive information
- [ ] Audit logging is enabled
- [ ] Dependency vulnerabilities are checked

---

## 14. Future Enhancements

### Phase 2 Features

1. **Two-Factor Authentication (2FA)**
   - TOTP (Google Authenticator)
   - SMS OTP
   - Email OTP

2. **OAuth2 Integration**
   - Google OAuth
   - GitHub OAuth
   - Facebook OAuth

3. **Single Sign-On (SSO)**
   - SAML 2.0
   - OIDC
   - Enterprise SSO

4. **Advanced Session Management**
   - Device fingerprinting
   - IP whitelisting
   - Session timeouts
   - Concurrent session limits

5. **Audit & Compliance**
   - Login history
   - Password change history
   - Account activity logs
   - Compliance reporting

---

## 15. References

### Documentation

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport.js](http://www.passportjs.org/)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [TypeORM Documentation](https://typeorm.io/)

### Standards

- ISO 25010:2023 - Software Quality Requirements
- ISO 27001:2022 - Information Security Management
- OWASP Top 10
- NIST SP 800-63B - Digital Identity Guidelines

---

**Document Status**: Draft  
**Next Review**: 2026-09-14  
**Approval Required**: Tech Lead, Security Officer

---

*This document serves as the technical blueprint for the Auth module implementation. All developers must follow this design to ensure consistency and security.*