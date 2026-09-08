Authentication & Authorization Module - Requirements Document

Project: Mixer - Marketing Automation Platform
Module: Authentication & Authorization (Auth Module)
Version: 1.0.0
Date: 2026-09-07
Status: Draft
Owner: Mixer Development Team

Table of Contents

Overview

Business Requirements

Functional Requirements

Non-Functional Requirements

Security Requirements

Technical Requirements

User Stories

Acceptance Criteria

Dependencies

Constraints

1. Overview

1.1 Purpose

The Authentication & Authorization Module provides secure user authentication, authorization, and identity management for the Mixer platform. This module ensures that only authenticated and authorized users can access the system resources.

1.2 Scope

User registration and login

JWT-based authentication

Password management (reset, change)

Role-based access control (RBAC)

Email verification

Session management

Token refresh mechanism

1.3 Stakeholders

End Users: Register, login, manage profile

Administrators: Manage users, assign roles

Developers: Integrate auth into other modules

Security Team: Ensure compliance with security standards

1.4 References

ISO 25010:2023 - Software Quality Requirements

ISO 27001:2022 - Information Security Management

OWASP Authentication Cheat Sheet

JWT RFC 7519

NestJS Authentication Documentation

2. Business Requirements

BR-001: User Registration

Priority: Must Have
Description: Users must be able to register an account using email and password.

Business Rules:

Email must be unique across the system

Password must meet minimum security requirements

User must verify email before accessing the system

Default role assigned to new users: user

Success Criteria:

User can register with valid email and password

System sends verification email

User cannot login until email is verified

BR-002: User Login

Priority: Must Have
Description: Registered users must be able to login with credentials.

Business Rules:

Maximum 5 failed login attempts per 15 minutes

Account locked for 30 minutes after 5 failed attempts

Successful login returns JWT access token and refresh token

Login session tracked in database

Success Criteria:

User can login with valid credentials

User receives access and refresh tokens

Failed attempts are tracked and limited

BR-003: Password Management

Priority: Must Have
Description: Users must be able to reset and change their password.

Business Rules:

Password reset token valid for 1 hour

Password change requires current password verification

Password history kept (last 5 passwords cannot be reused)

Password reset link expires after single use

Success Criteria:

User can request password reset via email

User can set new password using reset token

User can change password while logged in

BR-004: Role-Based Access Control

Priority: Must Have
Description: System must support multiple user roles with different permissions.

Business Rules:

Predefined roles: admin, user, manager

Admins have full system access

Users have limited access to their own data

Managers can manage campaigns and products

Roles can be assigned/revoked by admins

Success Criteria:

Users can only access resources based on their role

Role-based guards protect endpoints

Admins can manage user roles

BR-005: Session Management

Priority: Must Have
Description: System must manage user sessions securely.

Business Rules:

Access token expires in 15 minutes

Refresh token expires in 7 days

Refresh token can be used only once

User can logout from all devices

Active sessions can be viewed by user

Success Criteria:

User remains logged in with valid refresh token

User can logout and invalidate tokens

User can view and manage active sessions

BR-006: Email Verification

Priority: Must Have
Description: Users must verify their email address before accessing the system.

Business Rules:

Verification token valid for 24 hours

User can request new verification email

Verified users cannot change email without re-verification

Unverified accounts are deleted after 30 days

Success Criteria:

User receives verification email after registration

User can verify email by clicking link

User cannot login until email is verified

3. Functional Requirements

FR-001: User Registration

Priority: Must Have
Description: Implement user registration functionality.

Input:

Email (valid email format)

Password (min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char)

Name (min 2 characters, max 100 characters)

Process:

Validate input data

Check if email already exists

Hash password using bcrypt (10 rounds)

Create user with emailVerified: false

Generate email verification token

Send verification email

Return success response

Output:

Success message

User ID

Verification email sent confirmation

Error Handling:

400: Invalid input data

409: Email already exists

500: Email sending failed

FR-002: User Login

Priority: Must Have
Description: Implement user login with JWT authentication.

Input:

Email

Password

Process:

Validate input data

Find user by email

Check if account is locked

Verify password

Check if email is verified

Generate access token (15 min expiry)

Generate refresh token (7 days expiry)

Store refresh token in database

Track login session

Return tokens and user data

Output:

Access token (JWT)

Refresh token

User data (id, email, name, roles)

Error Handling:

400: Invalid input

401: Invalid credentials

403: Account locked or email not verified

404: User not found

4. Non-Functional Requirements

NFR-001: Performance

Login response time: < 500ms

Token refresh response time: < 200ms

Password reset email delivery: < 5 minutes

Support 1000 concurrent login requests

Database query optimization with indexes

NFR-002: Scalability

Support 100,000+ users

Horizontal scaling support

Stateless authentication (JWT)

Redis cache for token blacklist (optional)

NFR-003: Availability

Uptime: 99.9%

Graceful degradation if email service is down

Database connection pooling

NFR-004: Maintainability

Modular architecture

Clear separation of concerns

Comprehensive logging

Error tracking and monitoring

NFR-005: Usability

Clear error messages

Password strength indicator

Email verification reminders

Intuitive password reset flow

5. Security Requirements

SR-001: Password Security

Minimum 8 characters

At least 1 uppercase letter

At least 1 lowercase letter

At least 1 number

At least 1 special character

Bcrypt hashing with 10 rounds

Password history (last 5 passwords)

Password strength validation on registration/reset

SR-002: Token Security

JWT signed with HS256 algorithm

Secure secret key (minimum 32 characters)

Access token expiry: 15 minutes

Refresh token expiry: 7 days

Refresh token rotation (one-time use)

Token stored securely (httpOnly cookie option)

SR-003: Brute Force Protection

Maximum 5 failed login attempts per 15 minutes

Account lockout for 30 minutes after 5 failed attempts

Rate limiting on authentication endpoints

IP-based tracking (optional)

SR-004: Email Security

Verification tokens expire in 24 hours

Password reset tokens expire in 1 hour

Secure token generation (crypto.randomBytes)

Single-use tokens

HTTPS only for all auth endpoints

SR-005: Data Protection

Passwords never stored in plain text

Sensitive data encrypted at rest

TLS 1.3 for all communications

CORS properly configured

Security headers (Helmet.js)

SR-006: Audit & Logging

All authentication events logged

Failed login attempts tracked

Password changes logged

Email verification events logged

Session creation/deletion tracked

SR-007: Compliance

GDPR compliant (data privacy)

OWASP Top 10 mitigated

No sensitive data in logs

Secure session management

6. Technical Requirements

TR-001: Technology Stack

Framework: NestJS v12+

Language: TypeScript

ORM: TypeORM

Authentication: Passport.js + JWT

Password Hashing: bcrypt

Validation: class-validator

Email: Nodemailer / SendGrid

Database: PostgreSQL

TR-002: Database Schema

Users Table

sql
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
name VARCHAR(100) NOT NULL,
email_verified BOOLEAN DEFAULT FALSE,
email_verification_token VARCHAR(255),
email_verification_expires TIMESTAMP,
password_reset_token VARCHAR(255),
password_reset_expires TIMESTAMP,
failed_login_attempts INTEGER DEFAULT 0,
locked_until TIMESTAMP,
last_login TIMESTAMP,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
deleted_at TIMESTAMP
);

Refresh Tokens Table

sql
CREATE TABLE refresh_tokens (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
token VARCHAR(255) UNIQUE NOT NULL,
expires_at TIMESTAMP NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
revoked BOOLEAN DEFAULT FALSE
);

Password History Table

sql
CREATE TABLE password_history (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
password_hash VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);

Sessions Table

sql
CREATE TABLE sessions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
ip_address VARCHAR(45),
user_agent TEXT,
refresh_token VARCHAR(255) UNIQUE NOT NULL,
expires_at TIMESTAMP NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
last_active TIMESTAMP DEFAULT NOW()
);

Roles Table (for RBAC)

sql
CREATE TABLE roles (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(50) UNIQUE NOT NULL,
description TEXT,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_roles (
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
created_at TIMESTAMP DEFAULT NOW(),
PRIMARY KEY (user_id, role_id)
);

7. User Stories

US-001: User Registration

As a new user
I want to register an account
So that I can access the platform

Acceptance Criteria:

User can register with email and password

System validates email format

System checks password strength

System sends verification email

User account is created with emailVerified: false

US-002: User Login

As a registered user
I want to login with my credentials
So that I can access my account

Acceptance Criteria:

User can login with email and password

System returns JWT tokens

System tracks login session

Failed attempts are limited (5 per 15 minutes)

Account locks after 5 failed attempts

US-003: Email Verification

As a new user
I want to verify my email
So that I can access the system

Acceptance Criteria:

User receives verification email after registration

User can click link to verify email

User cannot login until email is verified

User can request new verification email

US-004: Password Reset

As a registered user
I want to reset my password
So that I can regain access if I forget it

Acceptance Criteria:

User can request password reset via email

User receives reset link

Reset link expires after 1 hour

User can set new password

User is logged out from all sessions after reset

US-005: Role-Based Access

As an admin
I want to assign roles to users
So that they have appropriate permissions

Acceptance Criteria:

Admins can assign roles (admin, user, manager)

Users can only access resources based on their role

Role changes take effect immediately

System enforces role-based access control

US-006: Session Management

As a logged-in user
I want to manage my active sessions
So that I can secure my account

Acceptance Criteria:

User can view all active sessions

User can logout from specific session

User can logout from all sessions

Session shows device info, IP, and last active

8. Acceptance Criteria

AC-001: Registration Flow

User fills registration form with email, password, name

System validates all fields

System checks email uniqueness

System validates password strength

System hashes password with bcrypt (10 rounds)

System creates user record with emailVerified: false

System generates verification token

System sends verification email

System returns success response with user ID

User receives email with verification link

AC-002: Login Flow

User enters email and password

System validates input

System finds user by email

System checks if account is locked

System verifies password with bcrypt

System checks if email is verified

System generates access token (15 min)

System generates refresh token (7 days)

System stores refresh token in database

System creates session record

System returns tokens and user data

System updates last login timestamp

AC-003: Token Refresh Flow

Client sends refresh token

System validates refresh token

System checks if token exists and is not revoked

System checks if token is not expired

System generates new access token

System generates new refresh token (rotate)

System revokes old refresh token

System stores new refresh token

System returns new tokens

AC-004: Password Reset Flow

User requests password reset with email

System finds user by email

System generates reset token (valid 1 hour)

System stores token in database

System sends reset email

User clicks reset link

User enters new password

System validates token

System validates new password

System checks password history

System hashes new password

System updates user password

System clears reset token

System revokes all sessions

System sends confirmation email

AC-005: Email Verification Flow

User registers account

System generates verification token (valid 24 hours)

System sends verification email

User clicks verification link

System validates token

System checks if token is expired

System updates user emailVerified to true

System clears verification token

System sends welcome email

User can now login

AC-006: Role-Based Access

Admin assigns role to user

User makes authenticated request

System extracts JWT token

System validates token

System extracts user roles

System checks if user has required role

If yes, allow access

If no, return 403 Forbidden

9. Dependencies

Internal Dependencies

Database: PostgreSQL for user data storage

Email Service: SMTP server or SendGrid for sending emails

Config Module: Environment configuration

External Dependencies

NestJS: Framework

Passport.js: Authentication middleware

JWT: Token-based authentication

bcrypt: Password hashing

Nodemailer: Email sending

class-validator: Input validation

Module Dependencies

Users Module: User management (may be part of Auth)

Settings Module: Email template configuration

Notifications Module: In-app notifications (future)

10. Constraints

Technical Constraints

Must use JWT for authentication (stateless)

Must use bcrypt for password hashing

Must support PostgreSQL database

Must be compatible with NestJS framework

Security Constraints

Passwords must never be logged

Tokens must be transmitted over HTTPS only

Session data must be encrypted at rest

Rate limiting must be implemented

Business Constraints

Email verification is mandatory before login

Maximum 5 failed login attempts

Password reset tokens expire in 1 hour

Refresh tokens expire in 7 days

Compliance Constraints

GDPR compliant (data privacy)

OWASP Top 10 security standards

ISO 27001 security requirements

11. Testing Requirements

Unit Tests

Password hashing/unhashing

JWT token generation/validation

Input validation

Business logic

Integration Tests

Registration flow

Login flow

Password reset flow

Email verification flow

Token refresh flow

Role-based access

E2E Tests

Complete user journey (register -> verify -> login -> logout)

Password reset flow

Session management

Rate limiting

Security Tests

SQL injection prevention

XSS prevention

CSRF protection

Brute force protection

Token security

12. API Specifications

12.1 Request/Response Formats

Register Request

POST /api/v1/auth/register
{
  `email`: `string` (required, valid email),
  `password`: `string` (required, min 8 chars),

ame`: `string` (required, min 2 chars)
}

Register Response

{
  `success`: true,
  `message`: `Registration successful. Please verify your email.`,
  `data`: {
    `userId`: `string`
  }
}

Login Request

POST /api/v1/auth/login
{
  `email`: `string` (required),
  `password`: `string` (required)
}

Login Response

{
  `success`: true,
  `data`: {
    `accessToken`: `string`,
    `refreshToken`: `string`,
    `user`: {
      `id`: `string`,
      `email`: `string`,

ame`: `string`,
      `role`: `string`,
      `emailVerified`: `boolean`
    }
  }
}

Error Response

{
  `success`: false,
  `message`: `Error message`,
  `error`: `ERROR_CODE`
}

12.2 Authentication Headers

Authorization: Bearer <access_token>
`Content-Type: application/json```

### 12.3 Rate Limit Headers
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1234567890```

---


## 13. Implementation Roadmap

### Phase 1: Core Authentication (Week 1-2)
- [x] Project setup and configuration
- [x] Database schema design
- [x] User entity and migration
- [x] Password hashing utilities
- [x] JWT token utilities
- [x] Registration endpoint
- [x] Login endpoint
- [x] Basic input validation

### Phase 2: Token Management (Week 3)
- [x] Refresh token implementation
- [x] Token refresh endpoint
- [x] Logout functionality
- [x] JWT auth guard
- [x] Protected routes

### Phase 3: Email & Password (Week 4)
- [x] Email service setup
- [x] Email verification flow
- [x] Password reset request
- [x] Password reset confirmation
- [x] Email templates

### Phase 4: Advanced Features (Week 5)
- [ ] Role-based access control
- [ ] Session management
- [ ] Change password
- [ ] Password history
- [ ] Account lockout

### Phase 5: Testing & Documentation (Week 6)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] API documentation
- [ ] Deployment guide

---

## 14. Monitoring & Logging

### 14.1 Metrics to Track
- Registration success rate
- Login success/failure rate
- Token refresh success rate
- Password reset requests
- Email delivery rate
- Average response times
- Error rates by endpoint

### 14.2 Log Events
- User registration
- User login (success/failure)
- User logout
- Password reset requested
- Password reset completed
- Email verified
- Role changed
- Account locked/unlocked

### 14.3 Alerts
- High login failure rate
- Unusual registration patterns
- Email delivery failures
- Token validation errors
- Database connection issues

---

## 15. Documentation Requirements

### 15.1 Developer Documentation
- API endpoint documentation
- Authentication flow diagrams
- Database schema documentation
- Configuration guide
- Deployment guide
- Troubleshooting guide

### 15.2 User Documentation
- Registration guide
- Login guide
- Password reset guide
- Email verification guide
- Account management guide
- Security best practices

### 15.3 Security Documentation
- Security architecture
- Threat model
- Incident response plan
- Security audit checklist

---

## 16. Appendix

### A. Password Strength Validator Regex
```javascript
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

B. JWT Token Payload Examples

Access Token:

{
  `sub`: `user-uuid`,
  `email`: `user@example.com`,
  `role`: `user`,
  `iat`: 1234567890,
  `exp`: 1234567890 + 900
}

Refresh Token:

{
  `sub`: `user-uuid`,
  `type`: `refresh`,
  `iat`: 1234567890,
  `exp`: 1234567890 + 604800
}

C. Error Codes Reference

Code

HTTP Status

Description

AUTH-001

400

Invalid input data

AUTH-002

409

Email already exists

AUTH-003

401

Invalid credentials

AUTH-004

403

Account locked

AUTH-005

403

Email not verified

AUTH-006

401

Invalid or expired token

AUTH-007

404

User not found

AUTH-008

400

Invalid or expired reset token

AUTH-009

429

Rate limit exceeded

AUTH-010

500

Internal server error

D. Environment Variables Checklist

# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mixer

# JWT
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
JWT_REFRESH_EXPIRY=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@mixer.com

# App URLs
APP_URL=http://localhost:4080
API_URL=http://localhost:3000/api/v1

# Rate Limiting
AUTH_THROTTLE_TTL=900000
AUTH_THROTTLE_LIMIT=5

17. Document History

Version

Date

Author

Changes

1.0

2026-09-07

Mixer Team

Initial requirements document

18. Approval

Role

Name

Signature

Date

Product Owner







Tech Lead







Security Officer







QA Lead







Next Steps:

Review requirements with stakeholders

Prioritize features for MVP

Create technical design document

Implement module following DDD pattern

Write comprehensive tests

Deploy to staging environment

User acceptance testing

Deploy to production

Contact: For questions or clarifications, contact the Mixer Development Team.