import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserMetadataService } from '../../../src/modules/users/services/user-metadata.service';
import { UserMetadata } from '../../../src/modules/users/entities/user-metadata.entity';

describe('UserMetadataService', () => {
  let service: UserMetadataService;

  const mockMetadataRepository = {
    findByUserId: jest.fn(),
    findByKey: jest.fn(),
    upsert: jest.fn(),
    deleteByKey: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMetadataService,
        {
          provide: getRepositoryToken(UserMetadata),
          useValue: mockMetadataRepository,
        },
      ],
    }).compile();

    service = module.get<UserMetadataService>(UserMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllMetadata', () => {
    it('should return all metadata as object', async () => {
      const mockMetadataList = [
        { key: 'color', value: 'blue' },
        { key: 'food', value: 'pizza' },
        { key: 'city', value: 'Jakarta' },
      ] as UserMetadata[];

      mockMetadataRepository.findByUserId.mockResolvedValue(mockMetadataList);

      const result = await service.getAllMetadata('user-123');

      expect(result).toEqual({
        color: 'blue',
        food: 'pizza',
        city: 'Jakarta',
      });
    });

    it('should return empty object when no metadata', async () => {
      mockMetadataRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getAllMetadata('user-123');

      expect(result).toEqual({});
    });
  });

  describe('getMetadataByKey', () => {
    it('should return metadata value by key', async () => {
      const mockMetadata = {
        key: 'favorite_color',
        value: 'blue',
      } as UserMetadata;

      mockMetadataRepository.findByKey.mockResolvedValue(mockMetadata);

      const result = await service.getMetadataByKey('user-123', 'favorite_color');

      expect(result).toBe('blue');
    });

    it('should throw NotFoundException when key not found', async () => {
      mockMetadataRepository.findByKey.mockResolvedValue(null);

      await expect(service.getMetadataByKey('user-123', 'non-existent')).rejects.toThrow(
        'Metadata key "non-existent" not found',
      );
    });
  });

  describe('setMetadata', () => {
    it('should set metadata successfully', async () => {
      const mockMetadata = {
        id: 'meta-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
        key: 'favorite_color',
        value: 'blue',
      } as UserMetadata;

      mockMetadataRepository.upsert.mockResolvedValue(mockMetadata);

      const result = await service.setMetadata('user-123', 'tenant-123', 'favorite_color', 'blue');

      expect(result.value).toBe('blue');
      expect(mockMetadataRepository.upsert).toHaveBeenCalledWith(
        'user-123',
        'tenant-123',
        'favorite_color',
        'blue',
      );
    });
  });

  describe('deleteMetadata', () => {
    it('should delete metadata successfully', async () => {
      mockMetadataRepository.deleteByKey.mockResolvedValue(undefined);

      await expect(service.deleteMetadata('user-123', 'favorite_color')).resolves.toBeUndefined();
      expect(mockMetadataRepository.deleteByKey).toHaveBeenCalledWith('user-123', 'favorite_color');
    });
  });
});
