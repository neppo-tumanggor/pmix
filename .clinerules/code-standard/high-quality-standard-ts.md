# High Quality TypeScript Standard 2026

**Project**: Mixer - Enterprise Marketing Platform  
**Standard Version**: 2026.1  
**TypeScript Version**: 5.3+  
**Strict Mode**: ✅ Required

---

## 🎯 CORE PRINCIPLES

1. **Type Safety First** - No `any`, use proper types
2. **Explicit Over Implicit** - Always be clear about intent
3. **Immutability** - Prefer `readonly` and `const`
4. **Composition Over Inheritance** - Use interfaces and composition
5. **Fail Fast** - Validate early, throw errors immediately

---

## ⚙️ COMPILER CONFIGURATION

### `tsconfig.json` - Strict Mode Required

```json
{
  "compilerOptions": {
    // Strict Checks (ALL required)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    
    // Module Resolution
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    
    // Output
    "target": "ES2022",
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    
    // Path Mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    
    // Other
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowJs": false,
    "checkJs": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## 📝 NAMING CONVENTIONS

### Files
```
✅ GOOD:
- user.service.ts
- create-user.dto.ts
- user.entity.ts
- auth.module.ts
- index.ts

❌ BAD:
- UserService.ts (PascalCase)
- user_service.ts (snake_case)
- User.ts (too generic)
```

### Classes & Interfaces
```typescript
✅ GOOD:
class UserService {}
interface UserRepository {}
type UserId = string;

❌ BAD:
class userService {} (camelCase)
interface user_repository {} (snake_case)
```

### Methods & Variables
```typescript
✅ GOOD:
const getUserById = (id: string) => {};
let userName = 'John';

❌ BAD:
const GetUserById = () => {} (PascalCase)
let UserName = 'John' (PascalCase)
```

### Constants
```typescript
✅ GOOD:
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

❌ BAD:
const maxRetries = 3; (camelCase)
const apiBaseUrl = '...'; (camelCase)
```

### Private Members
```typescript
✅ GOOD (Option 1 - # prefix):
class UserService {
  #userRepository: UserRepository;
  
  #getUserById(id: string) {
    return this.#userRepository.findById(id);
  }
}

✅ GOOD (Option 2 - _ prefix):
class UserService {
  private _userRepository: UserRepository;
}

❌ BAD:
class UserService {
  private userRepository: UserRepository; // No prefix
}
```

---

## 🔒 TYPE SAFETY RULES

### Rule 1: No `any` Type
```typescript
❌ BAD:
function process(data: any) { }

✅ GOOD:
function process(data: UserDto) { }
// OR if truly unknown:
function process(data: unknown) { }
```

### Rule 2: Use `unknown` Over `any`
```typescript
❌ BAD:
const data: any = JSON.parse(jsonString);

✅ GOOD:
const data: unknown = JSON.parse(jsonString);
if (isUser(data)) {
  console.log(data.name);
}
```

### Rule 3: Type Guards Required
```typescript
// Define type guards
const isUser = (obj: unknown): obj is User => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'email' in obj;
};

// Usage
function processUser(data: unknown) {
  if (isUser(data)) {
    console.log(data.email); // Type-safe
  }
}
```

### Rule 4: Discriminated Unions
```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error };

function handleResult<T>(result: Result<T>) {
  if (result.success) {
    console.log(result.data); // Type-safe
  } else {
    console.error(result.error); // Type-safe
  }
}
```

### Rule 5: Const Assertions
```typescript
❌ BAD:
const routes = ['/users', '/products', '/auth'];

✅ GOOD:
const routes = ['/users', '/products', '/auth'] as const;
// Type: readonly ['/users', '/products', '/auth']
```

---

## 🏗️ CODE ORGANIZATION

### Module Structure (Feature-Based)
```
src/modules/users/
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── index.ts
├── entities/
│   ├── user.entity.ts
│   └── index.ts
├── interfaces/
│   ├── user.repository.ts
│   └── index.ts
├── services/
│   ├── user.service.ts
│   └── index.ts
├── controllers/
│   ├── user.controller.ts
│   └── index.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── index.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── index.ts
├── __tests__/
│   ├── unit/
│   │   └── user.service.spec.ts
│   └── integration/
│       └── user.controller.spec.ts
├── constants/
│   ├── user-errors.enum.ts
│   └── index.ts
├── index.ts
└── README.md
```

### Barrel Exports (index.ts)
```typescript
// ✅ GOOD: Barrel exports per directory
export { CreateUserDto } from './create-user.dto';
export { UpdateUserDto } from './update-user.dto';
export { User } from './user.entity';
export { UserService } from './user.service';
export { UserController } from './user.controller';

// ❌ BAD: No barrel exports, direct imports everywhere
```

---

## 🎨 TYPE PATTERNS

### 1. DTOs with Validation
```typescript
import { z } from 'zod';

// Define schema
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Infer type from schema
export type CreateUserDto = z.infer<typeof CreateUserSchema>;

// Usage
function createUser(dto: CreateUserDto) {
  // dto is fully typed
}
```

### 2. Repository Pattern with Generics
```typescript
export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}

export class UserRepository implements Repository<User, string> {
  async findById(id: string): Promise<User | null> {
    // Implementation
  }
  
  async findAll(): Promise<User[]> {
    // Implementation
  }
  
  // ... other methods
}
```

### 3. Service Layer with Error Handling
```typescript
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  
  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    
    return user;
  }
  
  async createUser(dto: CreateUserDto): Promise<User> {
    // Validate
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    // Create user
    return this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
  }
}
```

### 4. Discriminated Unions for States
```typescript
type CampaignStatus = 
  | { state: 'draft' }
  | { state: 'scheduled'; scheduledAt: Date }
  | { state: 'running'; startedAt: Date }
  | { state: 'completed'; completedAt: Date }
  | { state: 'failed'; error: string };

function getCampaignInfo(campaign: Campaign) {
  switch (campaign.status.state) {
    case 'draft':
      return 'Campaign is in draft';
    case 'scheduled':
      return `Scheduled for ${campaign.status.scheduledAt}`;
    case 'running':
      return `Running since ${campaign.status.startedAt}`;
    // TypeScript ensures all cases are handled
  }
}
```

### 5. Utility Types
```typescript
// Partial - make all properties optional
type UpdateUserDto = Partial<User>;

// Required - make all properties required
type CreateUserDto = Required<Omit<User, 'id'>>;

// Pick - select specific properties
type UserEmail = Pick<User, 'email' | 'name'>;

// Omit - exclude specific properties
type PublicUser = Omit<User, 'password' | 'emailVerificationToken'>;

// Readonly - make all properties readonly
type ImmutableUser = Readonly<User>;

// Record - create object type with specific keys
type UserRoles = Record<string, UserRole>;

// Custom utility type
type Without<T, U> = {
  [P in Exclude<keyof T, keyof U>]?: never;
};
```

---

## 🔧 MODERN TYPESCRIPT FEATURES (2026)

### 1. Const Type Parameters
```typescript
function getFirstElement<T>(arr: T[]): T {
  return arr[0];
}

// Usage with inference
const first = getFirstElement([1, 2, 3]); // Type: number
const name = getFirstElement(['a', 'b']); // Type: string
```

### 2. Template Literal Types
```typescript
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// Type: 'onClick' | 'onFocus' | 'onBlur'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiEndpoint = `/${string}`;
type ApiRoute = `${HttpMethod} ${ApiEndpoint}`;
// Type: "GET /users" | "POST /users" | etc.
```

### 3. Satisfies Operator
```typescript
const routes = {
  home: '/',
  about: '/about',
  contact: '/contact',
} satisfies Record<string, string>;

// Type-safe and validated
routes.home; // Type: string
routes.about; // Type: string
```

### 4. Import Type
```typescript
// Only import type, not value
import type { User } from './user.entity';
import { UserService } from './user.service'; // Value import

// Usage in implementation
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  async getUser(id: string): Promise<User> {
    return this.userService.findById(id);
  }
}
```

### 5. satisfies for Configuration
```typescript
const config = {
  database: {
    host: 'localhost',
    port: 5432,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '15m',
  },
} satisfies Config;

// Type-safe config with validation
```

---

## 🎯 ERROR HANDLING PATTERNS

### Custom Error Classes
```typescript
// Base application error
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific errors
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

// Usage
throw new NotFoundError('User');
throw new ValidationError('Invalid email format');
```

### Result Type Pattern
```typescript
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

async function createUser(dto: CreateUserDto): Promise<Result<User>> {
  try {
    const user = await repository.create(dto);
    return { ok: true, value: user };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

// Usage
const result = await createUser(dto);
if (result.ok) {
  console.log(result.value.email);
} else {
  console.error(result.error.message);
}
```

---

## 🧪 TESTING STANDARDS

### Test File Naming
```
✅ GOOD:
user.service.spec.ts
user.controller.spec.ts
user.e2e-spec.ts

❌ BAD:
user.test.ts (use .spec.ts)
user.spec.ts (too generic)
```

### Test Structure (AAA Pattern)
```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };
      
      const expectedUser = { id: '123', ...dto };
      repository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await service.createUser(dto);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictError if email exists', async () => {
      // Arrange
      repository.findByEmail.mockResolvedValue({ id: '456' });

      // Act & Assert
      await expect(service.createUser(dto)).rejects.toThrow(ConflictError);
    });
  });
});
```

---

## 📚 DOCUMENTATION STANDARDS

### JSDoc Comments
```typescript
/**
 * Service for managing user operations.
 * 
 * @example
 * ```typescript
 * const user = await userService.getUserById('123');
 * ```
 */
export class UserService {
  /**
   * Retrieves a user by their unique identifier.
   * 
   * @param id - The user's unique identifier (UUID)
   * @returns The user object if found
   * @throws {NotFoundException} If user doesn't exist
   * 
   * @example
   * ```typescript
   * const user = await userService.getUserById('550e8400-e29b-41d4-a716-446655440000');
   * ```
   */
  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    
    return user;
  }
}
```

---

## 🔍 CODE QUALITY TOOLS

### ESLint Configuration (eslint.config.js)
```javascript
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  }
);
```

### Prettier Configuration (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## ✅ TYPE SCRIPT BEST PRACTICES CHECKLIST

### Before Every Commit
- [ ] TypeScript compiles without errors (`tsc --noEmit`)
- [ ] No `any` types used
- [ ] All functions have return types
- [ ] All parameters have types
- [ ] No unused variables or parameters
- [ ] All errors handled explicitly
- [ ] Tests pass with >80% coverage

### Code Review Checklist
- [ ] Types are explicit and meaningful
- [ ] No type assertions (`as`) unless absolutely necessary
- [ ] Discriminated unions used for state management
- [ ] Generics used for reusable code
- [ ] Error handling follows project pattern
- [ ] Documentation added for public APIs
- [ ] Tests cover happy path and error cases

---

## 🚫 ANTI-PATTERNS TO AVOID

```typescript
❌ DON'T:

// 1. Using any
function process(data: any) {}

// 2. Type assertion without validation
const user = data as User;

// 3. Ignoring errors
const result = asyncOperation(); // Missing await

// 4. Mutating parameters
function updateUser(user: User) {
  user.name = 'New Name'; // Mutation
}

// 5. Boolean parameters
function fetchData(verbose: boolean) {} // Unclear

// 6. Deep nesting
if (user) {
  if (user.profile) {
    if (user.profile.settings) {
      // Too deep
    }
  }
}

✅ DO:

// 1. Use proper types
function process(data: UserDto) {}

// 2. Validate and narrow types
if (isUser(data)) {
  console.log(data.name);
}

// 3. Handle async properly
const result = await asyncOperation();

// 4. Use immutability
function updateUser(user: User): User {
  return { ...user, name: 'New Name' };
}

// 5. Use enums or objects
type FetchOptions = { verbose: boolean };
function fetchData(options: FetchOptions) {}

// 6. Use early returns
if (!user?.profile?.settings) {
  return;
}
// Continue with settings
```

---

## 📊 QUALITY METRICS

| Metric | Target | Tool |
|--------|--------|------|
| Type Coverage | 100% | `tsc --noEmit` |
| Test Coverage | >80% | Vitest/Jest |
| Cyclomatic Complexity | <10 | ESLint |
| Code Duplication | <5% | SonarQube |
| Technical Debt | <1 hour | SonarQube |

---

## 🎓 CONTINUOUS LEARNING

- TypeScript官方博客: https://devblogs.microsoft.com/typescript/
- TypeScript Deep Dive: https://basarat.gitbook.io/typescript/
- Effective TypeScript: Book by Dan Vanderkam
- Type Challenges: https://github.com/type-challenges/type-challenges

---

**Standard berlaku untuk semua codebase Mixer platform.  
Question? Ask Tech Lead.**

*Version: 2026.1 | Updated: 2026-09-07*