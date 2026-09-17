# High Quality NestJS Standards 2026
## Enterprise-Grade Best Practices & References

**Project**: Mixer - Enterprise Marketing Automation Platform  
**Standard Version**: 2026.1  
**NestJS Version**: 12.x+ (latest stable)  
**TypeScript Version**: 5.3+  
**Node.js Version**: 20.x LTS+  
**Last Updated**: 2026-09-07

---

## 📋 TABLE OF CONTENTS

1. [Architecture Patterns](#architecture-patterns)
2. [Module Structure](#module-structure)
3. [Coding Standards](#coding-standards)
4. [Security Best Practices](#security-best-practices)
5. [Database Patterns](#database-patterns)
6. [API Design](#api-design)
7. [Testing Strategy](#testing-strategy)
8. [Performance Optimization](#performance-optimization)
9. [Error Handling](#error-handling)
10. [Official References](#official-references)

---

## 🏗️ ARCHITECTURE PATTERNS

### **1. Layered Architecture (Recommended)**

```
┌─────────────────────────────────────────────┐
│         Controller Layer                     │
│  (HTTP endpoints, validation, DTOs)          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Service Layer                        │
│  (Business logic, orchestration)             │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Repository Layer                     │
│  (Data access, queries, transactions)        │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Entity Layer                         │
│  (Database models, relationships)            │
└─────────────────────────────────────────────┘
```

**Reference**: [NestJS Architecture](https://docs.nestjs.com/architecture)

---

### **2. Domain-Driven Design (DDD) Pattern**

```typescript
// Domain Layer (Entities)
// entities/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

// Application Layer (Services)
// services/user.service.ts
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    // Business logic here
    const hashedPassword = await this.passwordService.hash(dto.password);
    const user = await this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    
    await this.emailService.sendVerificationEmail(user);
    return user;
  }
}

// Infrastructure Layer (Repositories)
// repositories/user.repository.ts
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }
}

// Presentation Layer (Controllers)
// controllers/user.controller.ts
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Public()
  @UseGuards(RateLimitGuard)
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }
}
```

**Reference**: [DDD in NestJS](https://docs.nestjs.com/recipes/ddd)

---

### **3. CQRS Pattern (Advanced)**

```typescript
// Commands (Write operations)
// commands/create-user.command.ts
export class CreateUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}

// Command Handler
// handlers/create-user.handler.ts
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: CreateUserCommand) {
    const { dto } = command;
    const user = await this.userRepository.create(dto);
    
    this.eventBus.publish(
      new UserCreatedEvent({
        userId: user.id,
        email: user.email,
      }),
    );
    
    return user;
  }
}

// Queries (Read operations)
// queries/get-user.query.ts
export class GetUserQuery {
  constructor(public readonly id: string) {}
}

// Query Handler
// handlers/get-user.handler.ts
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserQuery) {
    return this.userRepository.findById(query.id);
  }
}
```

**Reference**: [NestJS CQRS](https://docs.nestjs.com/recipes/cqrs)

---

## 📁 MODULE STRUCTURE

### **Feature-Based Module Structure (Recommended)**

```
src/modules/users/
├── __tests__/
│   ├── unit/
│   │   ├── user.service.spec.ts
│   │   ├── user.repository.spec.ts
│   │   └── password.service.spec.ts
│   └── integration/
│       ├── user.controller.spec.ts
│       └── user.e2e-spec.ts
├── commands/
│   ├── create-user.command.ts
│   └── handlers/
│       └── create-user.handler.ts
├── queries/
│   ├── get-user.query.ts
│   └── handlers/
│       └── get-user.handler.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── user-response.dto.ts
│   └── index.ts
├── entities/
│   ├── user.entity.ts
│   └── index.ts
├── repositories/
│   ├── user.repository.ts
│   ├── user.repository.interface.ts
│   └── index.ts
├── services/
│   ├── user.service.ts
│   ├── password.service.ts
│   ├── email.service.ts
│   └── index.ts
├── controllers/
│   ├── user.controller.ts
│   └── index.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   └── index.ts
├── decorators/
│   ├── current-user.decorator.ts
│   ├── roles.decorator.ts
│   ├── public.decorator.ts
│   └── index.ts
├── constants/
│   ├── user-errors.enum.ts
│   ├── user-events.enum.ts
│   └── index.ts
├── interfaces/
│   ├── user.interface.ts
│   └── index.ts
├── index.ts
└── user.module.ts
```

**Reference**: [NestJS Modules](https://docs.nestjs.com/modules)

---

### **Module Implementation Pattern**

```typescript
// modules/users/user.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // Other modules
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    PasswordService,
    EmailService,
    // Other providers
  ],
  exports: [
    UserService,
    UserRepository,
    // Export for use in other modules
  ],
})
export class UsersModule {}
```

---

## 💻 CODING STANDARDS

### **1. Controllers**

```typescript
// ✅ GOOD: Clean, RESTful, documented
import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import { RateLimit } from '../decorators/rate-limit.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Public()
  @RateLimit({ points: 3, duration: 3600 }) // 3 requests per hour
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email already exists' 
  })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.createUser(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User found',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }
}
```

---

### **2. Services**

```typescript
// ✅ GOOD: Single responsibility, dependency injection
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from './password.service';
import { EmailService } from './email.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
    private readonly userMapper: UserMapper,
  ) {}

  /**
   * Creates a new user account
   * @param dto - User creation data
   * @returns Created user (without sensitive data)
   * @throws {ConflictException} If email already exists
   */
  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Create user
    const user = await this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    // Send verification email (async, don't block)
    this.emailService.sendVerificationEmail(user).catch((err) => {
      console.error('Failed to send verification email', err);
    });

    // Return DTO (not entity)
    return this.userMapper.toResponseDto(user);
  }

  /**
   * Finds user by ID
   * @param id - User ID (UUID)
   * @returns User if found
   * @throws {NotFoundException} If user doesn't exist
   */
  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userMapper.toResponseDto(user);
  }
}
```

---

### **3. DTOs with Validation**

```typescript
// ✅ GOOD: Using class-validator with proper decorators
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ 
    example: 'john@example.com',
    description: 'User email address'
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'SecurePass123!',
    minLength: 8,
    description: 'User password (min 8 characters)'
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @ApiProperty({ 
    example: 'John Doe',
    maxLength: 100,
    description: 'User full name'
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    required: false,
    example: '+6281234567890',
    description: 'Phone number (optional)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

// Global validation pipe (main.ts)
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip non-whitelisted properties
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties present
    transform: true, // Auto-transform types
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
}
```

---

## 🔒 SECURITY BEST PRACTICES

### **1. Authentication & Authorization**

```typescript
// strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}

// guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../constants/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

**Reference**: [NestJS Authentication](https://docs.nestjs.com/security/authentication)

---

### **2. Password Hashing**

```typescript
// services/password.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { config } from '../../constants/auth.config';

@Injectable()
export class PasswordService {
  private readonly saltRounds = config.bcryptRounds; // 10

  /**
   * Hashes a plain text password
   * @param password - Plain text password
   * @returns Hashed password
   */
  async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new InternalServerErrorException('Failed to hash password');
    }
  }

  /**
   * Compares plain text password with hashed password
   * @param password - Plain text password
   * @param hashedPassword - Hashed password from database
   * @returns True if passwords match
   */
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      return false;
    }
  }
}
```

**Reference**: [NestJS Security](https://docs.nestjs.com/security/encryption-and-hashing)

---

### **3. Rate Limiting**

```typescript
// decorators/rate-limit.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { RateLimitGuard } from '../guards/rate-limit.guard';

export const RateLimit = (options: { points: number; duration: number }) =>
  applyDecorators(
    UseGuards(RateLimitGuard),
    SetMetadata('rateLimit', options),
  );

// guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly throttlerService: ThrottlerService,
  ) {
    super(reflector, throttlerService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limit = this.reflector.get('rateLimit', context.getHandler());
    if (!limit) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const key = request.ip;

    try {
      return await this.throttlerService.throttle(key, limit.points, limit.duration);
    } catch {
      throw new BadRequestException('Too many requests. Please try again later.');
    }
  }
}
```

**Reference**: [NestJS Throttler](https://docs.nestjs.com/security/throttler)

---

## 🗄️ DATABASE PATTERNS

### **1. Entity Design**

```typescript
// entities/user.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

@Entity('users')
@Index(['email']) // Index for frequently queried column
@Index(['createdAt']) // Index for sorting
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  password: string;

  @Column({ name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', nullable: true })
  lockedUntil: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Relations
  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];
}
```

---

### **2. Repository Pattern**

```typescript
// repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.repository.create(dto);
    return this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['refreshTokens'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  async findAll(options?: { skip?: number; take?: number }): Promise<User[]> {
    return this.repository.find({
      skip: options?.skip,
      take: options?.take,
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, partial: Partial<User>): Promise<User> {
    await this.repository.update(id, partial);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repository.exists({ where: { id } });
  }
}
```

**Reference**: [TypeORM with NestJS](https://docs.nestjs.com/techniques/database)

---

### **3. Database Transactions**

```typescript
// services/order.service.ts
import { DataSource } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Use query runner for transactions
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Create order
      const order = await queryRunner.manager.save(Order, dto);

      // Update product stock
      for (const item of dto.items) {
        await queryRunner.manager.decrement(
          Product,
          { id: item.productId },
          { stock: item.quantity },
        );
      }

      // Commit transaction
      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

---

## 🌐 API DESIGN

### **1. RESTful API Standards**

```typescript
// ✅ GOOD: RESTful conventions
@Controller('campaigns')
export class CampaignController {
  private readonly basePath = '/campaigns';

  // GET /campaigns - List campaigns
  @Get()
  async findAll(@Query() query: ListCampaignsQueryDto) {
    // Pagination, filtering, sorting
  }

  // GET /campaigns/:id - Get single campaign
  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Get by ID
  }

  // POST /campaigns - Create campaign
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCampaignDto) {
    // Create new resource
  }

  // PATCH /campaigns/:id - Partial update
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    // Partial update
  }

  // PUT /campaigns/:id - Full update
  @Put(':id')
  async replace(@Param('id') id: string, @Body() dto: CreateCampaignDto) {
    // Full replacement
  }

  // DELETE /campaigns/:id - Delete campaign
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    // Delete resource
  }

  // POST /campaigns/:id/send - Custom action
  @Post(':id/send')
  async send(@Param('id') id: string) {
    // Custom action
  }
}
```

---

### **2. Pagination & Filtering**

```typescript
// dto/list-campaigns-query.dto.ts
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignStatus } from '../constants/campaign-status.enum';

export class ListCampaignsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 20;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiProperty({ required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

// services/campaign.service.ts
async findAll(query: ListCampaignsQueryDto) {
  const { page, limit, search, status, sortBy, sortOrder } = query;
  
  const skip = (page - 1) * limit;
  
  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.name = ILike(`%${search}%`);
  }

  const [data, total] = await this.campaignRepository.findAndCount({
    where,
    skip,
    take: limit,
    order: { [sortBy]: sortOrder },
  });

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

### **3. API Versioning**

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
}

// controllers/v1/campaign.controller.ts
@Controller('campaigns')
@Version('1')
export class CampaignControllerV1 {
  // GET /api/v1/campaigns
}

// controllers/v2/campaign.controller.ts
@Controller('campaigns')
@Version('2')
export class CampaignControllerV2 {
  // GET /api/v2/campaigns
}
```

---

## 🧪 TESTING STRATEGY

### **1. Unit Tests**

```typescript
// __tests__/unit/user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from '../services/password.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    const mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    const mockPasswordService = {
      hash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
    passwordService = module.get(PasswordService);
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const createUserDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      repository.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('hashed_password');
      repository.create.mockResolvedValue({
        id: '123',
        ...createUserDto,
        password: 'hashed_password',
      });

      // Act
      const result = await service.createUser(createUserDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(repository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email exists', async () => {
      // Arrange
      const createUserDto = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      repository.findByEmail.mockResolvedValue({
        id: '456',
        email: createUserDto.email,
      } as any);

      // Act & Assert
      await expect(service.createUser(createUserDto))
        .rejects
        .toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      // Arrange
      const userId = '123';
      const user = { id: userId, email: 'test@example.com' };
      repository.findById.mockResolvedValue(user as any);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('456'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
```

**Reference**: [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

---

### **2. E2E Tests**

```typescript
// __tests__/e2e/user.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    
    // Get auth token
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    
    authToken = response.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          name: 'New User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('newuser@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return user by id', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
        });
    });
  });
});
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### **1. Database Query Optimization**

```typescript
// ❌ BAD: N+1 query problem
const campaigns = await this.campaignRepository.find();
for (const campaign of campaigns) {
  campaign.user = await this.userRepository.findById(campaign.userId); // N+1!
}

// ✅ GOOD: Use joins
const campaigns = await this.campaignRepository.find({
  relations: ['user', 'campaignTags', 'campaignTags.tag'],
});

// ✅ BETTER: Use query builder for complex queries
const campaigns = await this.campaignRepository
  .createQueryBuilder('campaign')
  .leftJoinAndSelect('campaign.user', 'user')
  .leftJoinAndSelect('campaign.campaignTags', 'campaignTag')
  .leftJoinAndSelect('campaignTag.tag', 'tag')
  .where('campaign.status = :status', { status: 'ACTIVE' })
  .orderBy('campaign.createdAt', 'DESC')
  .skip(0)
  .take(20)
  .getMany();
```

**Reference**: [TypeORM Query Builder](https://typeorm.io/select-query-builder)

---

### **2. Caching**

```typescript
// services/campaign.service.ts
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/common';

@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly cacheManager: Cache,
  ) {}

  // Cache with TTL (60 seconds)
  @CacheKey('campaigns:list')
  @CacheTTL(60)
  async findAll() {
    return this.campaignRepository.find();
  }

  // Invalidate cache after update
  async update(id: string, dto: UpdateCampaignDto) {
    const campaign = await this.campaignRepository.update(id, dto);
    
    // Invalidate cache
    await this.cacheManager.del(`campaigns:list`);
    await this.cacheManager.del(`campaign:${id}`);
    
    return campaign;
  }

  // Cache with custom key
  async findById(id: string) {
    const cacheKey = `campaign:${id}`;
    
    let campaign = await this.cacheManager.get<Campaign>(cacheKey);
    
    if (!campaign) {
      campaign = await this.campaignRepository.findById(id);
      await this.cacheManager.set(cacheKey, campaign, 60);
    }
    
    return campaign;
  }
}
```

**Reference**: [NestJS Cache](https://docs.nestjs.com/techniques/caching)

---

### **3. Background Jobs**

```typescript
// services/campaign.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class CampaignService {
  constructor(
    @InjectQueue('campaign') private campaignQueue: Queue,
  ) {}

  async sendCampaign(campaignId: string) {
    // Add job to queue (non-blocking)
    await this.campaignQueue.add('send-campaign', {
      campaignId,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}

// processors/campaign.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('campaign')
export class CampaignProcessor {
  constructor(private readonly campaignService: CampaignService) {}

  @Process('send-campaign')
  async handleSendCampaign(job: Job) {
    const { campaignId } = job.data;
    
    try {
      await this.campaignService.sendToRecipients(campaignId);
      
      // Report progress
      await job.progress(100);
    } catch (error) {
      console.error('Failed to send campaign', error);
      throw error; // Bull will retry
    }
  }
}
```

**Reference**: [NestJS Queues](https://docs.nestjs.com/techniques/queues)

---

## ⚠️ ERROR HANDLING

### **1. Custom Exceptions**

```typescript
// exceptions/app.exception.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : exceptionResponse['message'] || 'Error',
      ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
    };

    response.status(status).json(errorResponse);
  }
}

// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
}
```

---

### **2. Global Exception Handling**

```typescript
// exceptions/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = this.getStatus(exception);
    const message = this.getMessage(exception);

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        error: exception,
      }),
    };

    response.status(status).json(errorResponse);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.getResponse() as string;
    }
    if (exception instanceof Error) {
      return exception.message;
    }
    return 'Internal server error';
  }
}
```

---

## 📚 OFFICIAL REFERENCES

### **Official Documentation**
- **NestJS Official Docs**: https://docs.nestjs.com
- **NestJS GitHub**: https://github.com/nestjs/nest
- **NestJS Discord**: https://discord.gg/nestjs
- **NestJS Blog**: https://nestjs.com/blog

### **Official Guides**
1. **Architecture**: https://docs.nestjs.com/architecture
2. **Controllers**: https://docs.nestjs.com/controllers
3. **Providers**: https://docs.nestjs.com/providers
4. **Modules**: https://docs.nestjs.com/modules
5. **Middleware**: https://docs.nestjs.com/middleware
6. **Exception Filters**: https://docs.nestjs.com/exception-filters
7. **Pipes**: https://docs.nestjs.com/pipes
8. **Guards**: https://docs.nestjs.com/guards
9. **Interceptors**: https://docs.nestjs.com/interceptors
10. **Testing**: https://docs.nestjs.com/fundamentals/testing

### **Official Recipes**
1. **Database (TypeORM)**: https://docs.nestjs.com/techniques/database
2. **Authentication**: https://docs.nestjs.com/security/authentication
3. **Authorization**: https://docs.nestjs.com/security/authorization
4. **Caching**: https://docs.nestjs.com/techniques/caching
5. **Queues**: https://docs.nestjs.com/techniques/queues
6. **Validation**: https://docs.nestjs.com/techniques/validation
7. **CORS**: https://docs.nestjs.com/security/cors
8. **Compression**: https://docs.nestjs.com/techniques/compression
9. **Rate Limiting**: https://docs.nestjs.com/security/throttler
10. **OpenAPI (Swagger)**: https://docs.nestjs.com/openapi

### **Community Resources**
- **NestJS Academy**: https://academy.nestjs.com
- **NestJS Templates**: https://github.com/nestjs/typescript-starter
- **Awesome NestJS**: https://github.com/johnwebb-music/awesome-nestjs
- **NestJS Example Projects**: https://github.com/nestjs/nest/tree/master/sample

### **Books**
1. **"Mastering NestJS"** - By: Alex (Packt Publishing, 2024)
2. **"NestJS in Action"** - By: Moons (Manning, 2023)
3. **"Building APIs with NestJS"** - By: Pragmatic Programmers (2024)

### **Video Courses**
1. **NestJS Zero to Hero** - Udemy (by Ariel)
2. **NestJS Beyond the Basics** - Pluralsight
3. **Enterprise NestJS** - Frontend Masters

### **Blogs & Tutorials**
- **NestJS Blog**: https://nestjs.com/blog
- **TRADELAB Engineering**: https://dev.to/tradelab
- **LogRocket NestJS Articles**: https://blog.logrocket.com/tag/nestjs/
- **Medium NestJS Publications**: https://medium.com/tag/nestjs

---

## ✅ NESTJS QUALITY CHECKLIST

### **Code Quality**
- [ ] TypeScript strict mode enabled
- [ ] All services use `@Injectable()` decorator
- [ ] All controllers use `@Controller()` decorator
- [ ] All modules use `@Module()` decorator
- [ ] DTOs validated with class-validator
- [ ] No `any` types used
- [ ] All async functions return `Promise<T>`
- [ ] Dependency injection used throughout

### **Architecture**
- [ ] Separation of concerns (controllers, services, repositories)
- [ ] Single Responsibility Principle followed
- [ ] DDD pattern implemented (for complex domains)
- [ ] Module boundaries clear
- [ ] Barrel exports (index.ts) for clean imports

### **Security**
- [ ] Authentication implemented (JWT/Passport)
- [ ] Authorization guards on protected routes
- [ ] Passwords hashed with bcrypt
- [ ] Input validation on all endpoints
- [ ] Rate limiting on sensitive routes
- [ ] CORS configured
- [ ] Helmet headers enabled
- [ ] SQL injection prevented (TypeORM parameterized queries)

### **Testing**
- [ ] Unit tests for all services
- [ ] Integration tests for critical flows
- [ ] E2E tests for main user journeys
- [ ] Test coverage >85%
- [ ] All tests passing in CI/CD
- [ ] Mock external dependencies

### **Performance**
- [ ] Database queries optimized (no N+1)
- [ ] Indexes on frequently queried columns
- [ ] Caching implemented where appropriate
- [ ] No memory leaks
- [ ] Graceful shutdown implemented
- [ ] Health checks implemented

### **Documentation**
- [ ] Swagger/OpenAPI configured
- [ ] All endpoints documented
- [ ] JSDoc comments on public methods
- [ ] README with setup instructions
- [ ] Architecture diagrams
- [ ] API examples

---

**Standard ini diimplementasikan di seluruh codebase Mixer untuk memastikan konsistensi, maintainability, dan enterprise-grade quality.**

*Version: 1.0 | 2026-09-07 | Maintained by: Tech Lead & Engineering Team*