import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../../src/modules/users/services/users.service';
import { User } from '../../../src/modules/auth/entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile without sensitive fields', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        emailVerificationToken: 'token',
        passwordResetToken: 'token',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-123');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('emailVerificationToken');
      expect(result).not.toHaveProperty('passwordResetToken');
      expect(result).toHaveProperty('id', 'user-123');
      expect(result).toHaveProperty('email', 'test@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'old@example.com',
        name: 'Old Name',
        bio: 'Old bio',
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue({ ...existingUser, name: 'New Name' });

      const result = await service.updateProfile('user-123', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'old@example.com',
        name: 'Test User',
      };

      const anotherUser = {
        id: 'user-456',
        email: 'new@example.com',
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(anotherUser);

      await expect(
        service.updateProfile('user-123', { email: 'new@example.com' }),
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('softDelete', () => {
    it('should soft delete user successfully', async () => {
      mockUserRepository.softDelete.mockResolvedValue(undefined);

      await expect(service.softDelete('user-123')).resolves.toBeUndefined();
      expect(mockUserRepository.softDelete).toHaveBeenCalledWith('user-123');
    });
  });
});
