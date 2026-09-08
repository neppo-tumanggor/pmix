import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserPreferencesService } from '../../../src/modules/users/services/user-preferences.service';
import { UserPreferences } from '../../../src/modules/users/entities/user-preferences.entity';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;

  const mockPreferencesRepository = {
    findByUserId: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        {
          provide: getRepositoryToken(UserPreferences),
          useValue: mockPreferencesRepository,
        },
      ],
    }).compile();

    service = module.get<UserPreferencesService>(UserPreferencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPreferences', () => {
    it('should return user preferences', async () => {
      const mockPreferences = {
        id: 'pref-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
        theme: 'light',
        language: 'en',
      };

      mockPreferencesRepository.findByUserId.mockResolvedValue(mockPreferences);

      const result = await service.getPreferences('user-123');

      expect(result).toBeDefined();
      expect(result.theme).toBe('light');
      expect(result.language).toBe('en');
    });

    it('should throw NotFoundException when preferences not found', async () => {
      mockPreferencesRepository.findByUserId.mockResolvedValue(null);

      await expect(service.getPreferences('user-123')).rejects.toThrow('User preferences not found');
    });
  });

  describe('updatePreferences', () => {
    it('should create or update preferences', async () => {
      const mockPreferences = {
        id: 'pref-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
        theme: 'dark',
        language: 'id',
      };

      mockPreferencesRepository.createOrUpdate.mockResolvedValue(mockPreferences);

      const result = await service.updatePreferences('user-123', 'tenant-123', {
        theme: 'dark',
        language: 'id',
      });

      expect(result.theme).toBe('dark');
      expect(result.language).toBe('id');
      expect(mockPreferencesRepository.createOrUpdate).toHaveBeenCalledWith(
        'user-123',
        'tenant-123',
        { theme: 'dark', language: 'id' },
      );
    });
  });
});
