import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from '../../services/password.service';
import * as bcrypt from 'bcrypt';

describe('PasswordService', () => {
  let service: PasswordService;
  const BCRYPT_ROUNDS = 10;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'SecurePass123!';
      const hashedPassword = await service.hash(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SecurePass123!';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should hash with specified rounds', async () => {
      const password = 'TestPass123!';
      const hash = await service.hash(password, BCRYPT_ROUNDS);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });
  });

  describe('verify', () => {
    it('should verify correct password', async () => {
      const password = 'SecurePass123!';
      const hash = await service.hash(password);
      const isValid = await service.verify(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePass123!';
      const wrongPassword = 'WrongPass123!';
      const hash = await service.hash(password);
      const isValid = await service.verify(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const hash = await service.hash('password');
      const isValid = await service.verify('', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('validateStrength', () => {
    it('should accept valid strong password', async () => {
      const strongPassword = 'SecurePass123!';
      
      await expect(service.validateStrength(strongPassword)).resolves.not.toThrow();
    });

    it('should reject password shorter than 8 characters', async () => {
      const weakPassword = 'Sec1!';
      
      await expect(service.validateStrength(weakPassword)).rejects.toThrow();
    });

    it('should reject password without uppercase letter', async () => {
      const weakPassword = 'securepass123!';
      
      await expect(service.validateStrength(weakPassword)).rejects.toThrow();
    });

    it('should reject password without lowercase letter', async () => {
      const weakPassword = 'SECUREPASS123!';
      
      await expect(service.validateStrength(weakPassword)).rejects.toThrow();
    });

    it('should reject password without number', async () => {
      const weakPassword = 'SecurePass!';
      
      await expect(service.validateStrength(weakPassword)).rejects.toThrow();
    });

    it('should reject password without special character', async () => {
      const weakPassword = 'SecurePass123';
      
      await expect(service.validateStrength(weakPassword)).rejects.toThrow();
    });

    it('should accept password with various special characters', async () => {
      const passwords = [
        'SecurePass123@',
        'SecurePass123#',
        'SecurePass123$',
        'SecurePass123%',
        'SecurePass123&',
        'SecurePass123*',
      ];

      for (const password of passwords) {
        await expect(service.validateStrength(password)).resolves.not.toThrow();
      }
    });
  });

  describe('isPasswordUsed', () => {
    it('should return true if password was used before', async () => {
      const userId = 'user-123';
      const password = 'OldPass123!';
      const hashedPassword = await service.hash(password);

      // Mock password history
      jest.spyOn(service as any, 'findPasswordHistory').mockResolvedValue([
        { passwordHash: hashedPassword },
      ]);

      const isUsed = await service.isPasswordUsed(userId, password);
      expect(isUsed).toBe(true);
    });

    it('should return false if password was not used before', async () => {
      const userId = 'user-123';
      const password = 'NewPass123!';

      // Mock password history with different password
      jest.spyOn(service as any, 'findPasswordHistory').mockResolvedValue([
        { passwordHash: await service.hash('OldPass123!') },
      ]);

      const isUsed = await service.isPasswordUsed(userId, password);
      expect(isUsed).toBe(false);
    });

    it('should return false if no password history', async () => {
      const userId = 'user-123';
      const password = 'NewPass123!';

      jest.spyOn(service as any, 'findPasswordHistory').mockResolvedValue([]);

      const isUsed = await service.isPasswordUsed(userId, password);
      expect(isUsed).toBe(false);
    });
  });

  describe('saveToHistory', () => {
    it('should save password to history', async () => {
      const userId = 'user-123';
      const passwordHash = 'hashed-password';

      const mockRepository = {
        create: jest.fn().mockReturnValue({ userId, passwordHash }),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(service as any, 'userRepository', 'get').mockReturnValue(mockRepository);

      await service.saveToHistory(userId, passwordHash);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        passwordHash,
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
