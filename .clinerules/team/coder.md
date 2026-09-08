# Auth Module - Coder Guidelines

**Role**: Senior Software Engineer  
**Task**: Implement Auth Module  
**Stack**: NestJS, TypeScript, TypeORM, PostgreSQL, JWT, Passport  

---

## 🎯 My Responsibilities

1. **Write clean, production-ready code** following DDD principles
2. **Implement security best practices** (OWASP Top 10)
3. **Ensure testability** - write unit & integration tests
4. **Follow existing codebase patterns** and conventions
5. **Document as I code** - JSDoc, README, inline comments
6. **Review and optimize** database queries
7. **Handle errors gracefully** with proper HTTP status codes

---

## 🛠️ Tech Stack & Tools

```typescript
// Core
- NestJS v12+ (framework)
- TypeScript (strict mode)
- TypeORM (database ORM)
- PostgreSQL (database)

// Auth
- @nestjs/jwt (JWT tokens)
- @nestjs/passport (authentication)
- passport-jwt (JWT strategy)
- passport-local (local strategy)
- bcrypt (password hashing)

// Validation & Security
- class-validator (DTO validation)
- class-transformer (data transformation)
- @nestjs/throttler (rate limiting)
- helmet (security headers)

// Email
- @nestjs-modules/mailer (email sending)
- handlebars (email templates)

// Testing
- Jest (test framework)
- Supertest (HTTP testing)
```

---

## 📁 Module Structure (What I'll Build)

```
modules/auth/
├── auth.module.ts              # Module definition
├── auth.controller.ts          # REST endpoints
├── auth.service.ts             # Business logic
├── dto/                        # Data Transfer Objects
│   ├── register.dto.ts
│   ├── login.dto.ts
│   ├── refresh-token.dto.ts
│   ├── forgot-password.dto.ts
│   ├── reset-password.dto.ts
│   ├── change-password.dto.ts
│   └── verify-email.dto.ts
├── entities/                   # TypeORM entities
│   ├── user.entity.ts
│   ├── refresh-token.entity.ts
│   ├── session.entity.ts
│   └── password-history.entity.ts
├── interfaces/                 # TypeScript interfaces
│   ├── user.interface.ts
│   ├── jwt-payload.interface.ts
│   └── auth-response.interface.ts
├── strategies/                 # Passport strategies
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── guards/                     # Route guards
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/                 # Custom decorators
│   ├── roles.decorator.ts
│   ├── current-user.decorator.ts
│   └── public.decorator.ts
├── services/                   # Specialized services
│   ├── password.service.ts
│   ├── token.service.ts
│   ├── email.service.ts
│   ├── session.service.ts
│   └── account-lockout.service.ts
└── constants/                  # Enums & config
    ├── roles.enum.ts
    ├── error-codes.enum.ts
    └── auth.config.ts
```

---

## 💻 Coding Standards

### TypeScript
```typescript
// ✅ Use strict typing
- Strict null checks enabled
- No 'any' type unless absolutely necessary
- Prefer interfaces over types for object shapes
- Use enums for constants
```

### Naming Conventions
```typescript
// ✅ Follow NestJS conventions
- Files: kebab-case (user.entity.ts)
- Classes: PascalCase (UserService)
- Methods: camelCase (findByEmail)
- Variables: camelCase (userEmail)
- Constants: UPPER_SNAKE_CASE (MAX_ATTEMPTS)
- Private fields: prefix with # or _ (private #token)
```

### Error Handling
```typescript
// ✅ Use built-in exceptions
- BadRequestException (400)
- UnauthorizedException (401)
- ForbiddenException (403)
- NotFoundException (404)
- ConflictException (409)
- TooManyRequestsException (429)

// ✅ Custom error codes
throw new ConflictException('Email already exists', 'EMAIL_EXISTS');
```

### Database Queries
```typescript
// ✅ Use repositories, not raw queries
- Repository pattern for data access
- Query builder for complex queries
- Always use parameterized queries (prevent SQL injection)
- Add indexes for frequently queried fields
- Use transactions for multi-step operations
```

---

## 🔐 Security Implementation

### Password Security
```typescript
// ✅ Mandatory requirements
- Bcrypt with 10 rounds (configurable)
- Never log passwords
- Never return passwords in API responses
- Validate strength before hashing
- Check password history (last 5 passwords)
```

### JWT Tokens
```typescript
// ✅ Token security
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Refresh token rotation (one-time use)
- Store refresh tokens hashed in DB
- Use strong secrets (min 32 chars)
- Sign with HS256 algorithm
```

### Input Validation
```typescript
// ✅ Always validate
- Use class-validator decorators
- Whitelist allowed properties
- Transform input types
- Sanitize to prevent XSS
- Validate email format
- Validate password strength
```

### Rate Limiting
```typescript
// ✅ Apply to sensitive endpoints
POST /auth/register: 3 requests/hour
POST /auth/login: 5 requests/15min
POST /auth/forgot-password: 3 requests/hour
POST /auth/resend-verification: 3 requests/hour
```

---

## 🧪 Testing Requirements

### Unit Tests (Coverage > 80%)
```typescript
// ✅ Test these services
- PasswordService: hash, verify, validateStrength, isPasswordUsed
- TokenService: generate, verify, decode
- EmailService: all email methods
- AccountLockoutService: record, reset, isLocked
```

### Integration Tests
```typescript
// ✅ Test complete flows
- POST /auth/register (success, duplicate email, weak password)
- POST /auth/login (success, invalid creds, locked account)
- POST /auth/refresh (success, invalid token, expired token)
- POST /auth/forgot-password (success, user not found)
- POST /auth/reset-password (success, invalid token)
- POST /auth/verify-email (success, expired token)
```

### E2E Tests
```typescript
// ✅ Test user journeys
- Register → Verify Email → Login → Access Protected Route → Logout
- Forgot Password → Reset Password → Login with New Password
- Token Refresh Flow
- Session Management
```

---

## 📝 Implementation Checklist

### Phase 1: Setup (Day 1)
- [ ] Verify all dependencies installed
- [ ] Update .env.example with auth config
- [ ] Create directory structure
- [ ] Setup module imports in app.module.ts

### Phase 2: Database (Day 1-2)
- [ ] Create User entity
- [ ] Create RefreshToken entity
- [ ] Create Session entity
- [ ] Create PasswordHistory entity
- [ ] Create TypeORM migration
- [ ] Run migration successfully
- [ ] Create repository pattern

### Phase 3: Services (Day 2-3)
- [ ] Implement PasswordService
- [ ] Implement TokenService
- [ ] Implement EmailService
- [ ] Implement SessionService
- [ ] Implement AccountLockoutService
- [ ] Write unit tests for each service

### Phase 4: DTOs & Validation (Day 3)
- [ ] Create RegisterDto
- [ ] Create LoginDto
- [ ] Create RefreshTokenDto
- [ ] Create ForgotPasswordDto
- [ ] Create ResetPasswordDto
- [ ] Create ChangePasswordDto
- [ ] Create VerifyEmailDto
- [ ] Create response interfaces

### Phase 5: Strategies & Guards (Day 3)
- [ ] Implement JwtStrategy
- [ ] Implement LocalStrategy
- [ ] Implement JwtAuthGuard
- [ ] Implement RolesGuard
- [ ] Create @Public() decorator
- [ ] Create @Roles() decorator
- [ ] Create @CurrentUser() decorator

### Phase 6: Business Logic (Day 4)
- [ ] Implement AuthService.register()
- [ ] Implement AuthService.login()
- [ ] Implement AuthService.refreshToken()
- [ ] Implement AuthService.logout()
- [ ] Implement AuthService.forgotPassword()
- [ ] Implement AuthService.resetPassword()
- [ ] Implement AuthService.verifyEmail()
- [ ] Implement AuthService.changePassword()
- [ ] Implement AuthService.getProfile()

### Phase 7: Controller (Day 4)
- [ ] Implement all endpoints
- [ ] Add rate limiting decorators
- [ ] Add Swagger documentation
- [ ] Test all endpoints with Postman/Thunder Client

### Phase 8: Module Config (Day 4)
- [ ] Create AuthModule
- [ ] Register all providers
- [ ] Export guards for use in other modules
- [ ] Update AppModule

### Phase 9: Testing (Day 5)
- [ ] Write unit tests (coverage > 80%)
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Fix bugs found in testing
- [ ] Run lint and fix issues

### Phase 10: Documentation (Day 5)
- [ ] Add JSDoc to all services
- [ ] Add Swagger annotations
- [ ] Update README.md
- [ ] Document API endpoints

### Phase 11: Deployment (Day 6)
- [ ] Create database migration
- [ ] Update environment variables
- [ ] Security review checklist
- [ ] Deploy to staging
- [ ] Manual testing in staging
- [ ] Deploy to production

---

## ✅ Definition of Done

Code is complete when:
- [ ] ✅ Implements requirements from requirements-auth.md
- [ ] ✅ Follows design from design.md
- [ ] ✅ All tests pass (unit, integration, E2E)
- [ ] ✅ Test coverage > 80%
- [ ] ✅ No TypeScript errors
- [ ] ✅ No ESLint warnings
- [ ] ✅ JSDoc comments added
- [ ] ✅ Swagger documentation complete
- [ ] ✅ Security best practices followed
- [ ] ✅ Error handling implemented
- [ ] ✅ Code reviewed by peer
- [ ] ✅ Deployed to production

---

## 🚨 Important Reminders

1. **Security First**: Never trust user input, always validate
2. **No Hardcoded Values**: Use environment variables
3. **No Console.log**: Use Logger service
4. **No Any Type**: Use proper TypeScript types
5. **No Secrets in Code**: Use .env files
6. **Always Hash Passwords**: Never store plain text
7. **Never Expose Passwords**: In responses or logs
8. **Use Transactions**: For multi-step database operations
9. **Handle Errors Gracefully**: User-friendly error messages
10. **Write Tests**: Every service and endpoint must be tested

---

## 🔍 Code Review Checklist

Before submitting PR:
- [ ] Code follows NestJS best practices
- [ ] All tests pass
- [ ] No security vulnerabilities
- [ ] Performance optimized (queries indexed)
- [ ] Error handling comprehensive
- [ ] Documentation complete
- [ ] No console.log or debugger statements
- [ ] Environment variables used correctly
- [ ] CORS configured properly
- [ ] Rate limiting implemented

---

## 📚 Reference Documents

- **Requirements**: `docs/requirements-auth.md`
- **Technical Design**: `docs/design.md`
- **Task Breakdown**: `docs/task-auth.md`
- **NestJS Docs**: https://docs.nestjs.com
- **OWASP Guide**: https://cheatsheetseries.owasp.org

---

## 🎯 Success Metrics

- **Performance**: Login < 500ms, Token refresh < 200ms
- **Security**: No critical vulnerabilities
- **Test Coverage**: > 80%
- **Code Quality**: ESLint score A
- **Documentation**: 100% endpoint coverage

---

*Let's build this properly. Security, scalability, and maintainability are non-negotiable.* 💪