import { Test, TestingModule } from '@nestjs/testing';
import { AccountLockoutService } from '../../services/account-lockout.service';
import { User, UserRole } from '../../entities/user.entity';

describe('AccountLockoutService', () => {
  let service: AccountLockoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountLockoutService],
    }).compile();

    service = module.get<AccountLockoutService>(AccountLockoutService);
  });

  describe('isLocked', () => {
    it('should return false for non-locked user', () => {
      const user: Partial<User> = {
        failedLoginAttempts: 2,
        lockedUntil: null,
      };

      const locked = service.isLocked(user as User);
      expect(locked).toBe(false);
    });

    it('should return true for locked user with future lock time', () => {
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
      const user: Partial<User> = {
        failedLoginAttempts: 5,
        lockedUntil: lockUntil,
      };

      const locked = service.isLocked(user as User);
      expect(locked).toBe(true);
    });

    it('should return false for user with past lock time', () => {
      const lockUntil = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
      const user: Partial<User> = {
        failedLoginAttempts: 5,
        lockedUntil: lockUntil,
      };

      const locked = service.isLocked(user as User);
      expect(locked).toBe(false);
    });
  });

  describe('verifyNotLocked', () => {
    it('should not throw for non-locked user', () => {
      const user: Partial<User> = {
        failedLoginAttempts: 2,
        lockedUntil: null,
      };

      expect(() => service.verifyNotLocked(user as User)).not.toThrow();
    });

    it('should throw ForbiddenException for locked user', () => {
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      const user: Partial<User> = {
        failedLoginAttempts: 5,
        lockedUntil: lockUntil,
      };

      expect(() => service.verifyNotLocked(user as User)).toThrow();
      expect(() => service.verifyNotLocked(user as User)).toThrow('Account locked');
    });
  });

  describe('recordFailedAttempt', () => {
    it('should increment failed login attempts', async () => {
      const user: Partial<User> = {
        id: 'user-123',
        failedLoginAttempts: 2,
        lockedUntil: null,
      };

      const mockRepository = {
        findOne: jest.fn().mockResolvedValue(user),
        save: jest.fn().mockResolvedValue(user),
      };

      jest.spyOn(service as any, 'userRepository', 'get').mockReturnValue(mockRepository);

      await service.recordFailedAttempt(user.id as string);

      expect(mockRepository.save).toHaveBeenCalled();
      const savedUser = mockRepository.save.mock.calls[0][0];
      expect(savedUser.failedLoginAttempts).toBe(3);
    });

    it('should lock account after 5 failed attempts', async () => {
      const user: Partial<User> = {
        id: 'user-123',
        failedLoginAttempts: 4,
        lockedUntil: null,
      };

      const mockRepository = {
        findOne: jest.fn().mockResolvedValue(user),
        save: jest.fn().mockImplementation((u) => Promise.resolve(u)),
      };

      jest.spyOn(service as any, 'userRepository', 'get').mockReturnValue(mockRepository);

      await service.recordFailedAttempt(user.id as string);

      const savedUser = mockRepository.save.mock.calls[0][0];
      expect(savedUser.lockedUntil).toBeDefined();
      expect(savedUser.failedLoginAttempts).toBe(5);
    });
  });

  describe('resetFailedAttempts', () => {
    it('should reset failed login attempts', async () => {
      const user: Partial<User> = {
        id: 'user-123',
        failedLoginAttempts: 3,
        lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
      };

      const mockRepository = {
        findOne: jest.fn().mockResolvedValue(user),
        save: jest.fn().mockImplementation((u) => Promise.resolve(u)),
      };

      jest.spyOn(service as any, 'userRepository', 'get').mockReturnValue(mockRepository);

      await service.resetFailedAttempts(user.id as string);

      const savedUser = mockRepository.save.mock.calls[0][0];
      expect(savedUser.failedLoginAttempts).toBe(0);
      expect(savedUser.lockedUntil).toBeNull();
    });
  });
});
