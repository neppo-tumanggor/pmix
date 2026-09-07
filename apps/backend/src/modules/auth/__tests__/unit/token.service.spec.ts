import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../services/token.service';
import { User, UserRole } from '../../entities/user.entity';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;

  const mockUser: Partial<User> = {
    id: 'user-123',
    email: 'test@example.com',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload: any) => Buffer.from(JSON.stringify(payload)).toString('base64')),
            verify: jest.fn((token: string) => JSON.parse(Buffer.from(token, 'base64').toString())),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('generateAccessToken', () => {
    it('should generate access token', () => {
      const token = service.generateAccessToken(mockUser as User);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should include user id, email, and role in token', () => {
      const token = service.generateAccessToken(mockUser as User);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      expect(decoded.sub).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token', () => {
      const token = service.generateRefreshToken(mockUser as User);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should include type refresh', () => {
      const token = service.generateRefreshToken(mockUser as User);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      expect(decoded.type).toBe('refresh');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = service.generateAccessToken(mockUser as User);
      const payload = service.verifyAccessToken(token);
      
      expect(payload.sub).toBe(mockUser.id);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = service.generateRefreshToken(mockUser as User);
      const payload = service.verifyRefreshToken(token);
      
      expect(payload.sub).toBe(mockUser.id);
      expect(payload.type).toBe('refresh');
    });
  });
});
