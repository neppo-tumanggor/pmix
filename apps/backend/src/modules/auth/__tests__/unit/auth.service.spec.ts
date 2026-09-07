import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth.service';
import { UserRole } from '../../entities/user.entity';
import { PasswordService } from '../../services/password.service';
import { TokenService } from '../../services/token.service';
import { EmailService } from '../../services/email.service';
import { AccountLockoutService } from '../../services/account-lockout.service';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn((pwd) => Promise.resolve(`hashed-${pwd}`)),
            verify: jest.fn((pwd) => Promise.resolve(pwd === 'correct-password')),
            validateStrength: jest.fn(),
            isPasswordUsed: jest.fn(() => Promise.resolve(false)),
            saveToHistory: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn(() => 'access-token'),
            generateRefreshToken: jest.fn(() => 'refresh-token'),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
          },
        },
        {
          provide: AccountLockoutService,
          useValue: {
            verifyNotLocked: jest.fn(),
            isLocked: jest.fn(() => false),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register new user', async () => {
      const registerDto = { email: 'new@example.com', password: 'SecurePass123!', name: 'New User' };
      
      jest.spyOn(service as any, 'userRepository', 'get').mockReturnValue({
        findOne: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ id: 'user-123' }),
        save: jest.fn((u) => u),
        create: jest.fn((d) => d),
      });

      const result = await service.register(registerDto as any);
      expect(result.success).toBe(true);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto = { email: 'test@example.com', password: 'correct-password' };
      
      jest.spyOn(service as any, 'userRepository', 'get').mockReturnValue({
        findOne: jest.fn().mockResolvedValue({ 
          id: 'user-123', 
          email: loginDto.email, 
          emailVerified: true,
          role: UserRole.USER 
        }),
        save: jest.fn(),
      });
      jest.spyOn(service as any, 'refreshTokenRepository', 'get').mockReturnValue({
        create: jest.fn(),
        save: jest.fn(),
      });

      const result = await service.login(loginDto as any);
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('access-token');
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      jest.spyOn(service as any, 'userRepository', 'get').mockReturnValue({
        findOne: jest.fn().mockResolvedValue({ id: 'user-123' }),
      });

      const result = await service.validateUser('test@example.com', 'correct-password');
      expect(result).toBeDefined();
    });

    it('should return null for invalid credentials', async () => {
      jest.spyOn(service as any, 'userRepository', 'get').mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      const result = await service.validateUser('test@example.com', 'wrong-password');
      expect(result).toBeNull();
    });
  });
});
