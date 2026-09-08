import { NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SettingsService } from './settings.service';
import { ISettingsRepository } from '../interfaces/settings.repository.interface';
import { IAuditLogRepository } from '../interfaces/audit-log.repository.interface';
import { EncryptionService } from './encryption.service';
import { CacheService } from './cache.service';
import { SettingCategory } from '../entities/settings.entity';
import { AuditAction } from '../entities/audit-log.entity';

describe('SettingsService', () => {
  let service: SettingsService;
  let settingsRepository: jest.Mocked<ISettingsRepository>;
  let auditLogRepository: jest.Mocked<IAuditLogRepository>;
  let encryptionService: jest.Mocked<EncryptionService>;
  let cacheService: jest.Mocked<CacheService>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    settingsRepository = {
      findByTenantCategoryAndKey: jest.fn(),
      findByTenantAndCategory: jest.fn(),
      findCategoriesByTenant: jest.fn(),
      create: jest.fn(),
      createInTransaction: jest.fn(),
      update: jest.fn(),
      updateInTransaction: jest.fn(),
      softDelete: jest.fn(),
      exists: jest.fn(),
      findById: jest.fn(),
    } as any;

    auditLogRepository = {
      create: jest.fn(),
      createInTransaction: jest.fn(),
      findByTenantId: jest.fn(),
      findByResource: jest.fn(),
      findByDateRange: jest.fn(),
    } as any;

    encryptionService = {
      encryptObject: jest.fn(),
      decryptObject: jest.fn(),
    } as any;

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      buildKey: jest.fn(),
    } as any;

    dataSource = {
      manager: {
        transaction: jest.fn(),
      },
    } as any;

    service = new SettingsService(
      settingsRepository,
      auditLogRepository,
      encryptionService,
      cacheService,
      dataSource,
    );
  });

  describe('getByCategory', () => {
    it('should return settings from cache when available', async () => {
      const tenantId = 'tenant-1';
      const category = SettingCategory.GENERAL;
      const cachedSettings = { app_name: 'Test App', timezone: 'UTC' };

      (cacheService.get as jest.Mock).mockResolvedValue(cachedSettings);

      const result = await service.getByCategory(tenantId, category);

      expect(result).toEqual(cachedSettings);
      expect(settingsRepository.findByTenantAndCategory).not.toHaveBeenCalled();
    });

    it('should fetch from database when not in cache', async () => {
      const tenantId = 'tenant-1';
      const category = SettingCategory.GENERAL;
      const settings = [
        { key: 'app_name', value: 'Test App', isEncrypted: false },
      ];

      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (settingsRepository.findByTenantAndCategory as jest.Mock).mockResolvedValue(settings as any);

      const result = await service.getByCategory(tenantId, category);

      expect(result).toEqual({ app_name: 'Test App' });
      expect(cacheService.set).toHaveBeenCalled();
    });
  });

  describe('getByKey', () => {
    it('should return a single setting', async () => {
      const tenantId = 'tenant-1';
      const category = SettingCategory.GENERAL;
      const key = 'app_name';

      (settingsRepository.findByTenantCategoryAndKey as jest.Mock).mockResolvedValue({
        key,
        value: 'Test App',
        isEncrypted: false,
      } as any);

      const result = await service.getByKey(tenantId, category, key);

      expect(result).toBe('Test App');
    });

    it('should throw NotFoundException when setting not found', async () => {
      (settingsRepository.findByTenantCategoryAndKey as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getByKey('tenant-1', SettingCategory.GENERAL, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('initializeDefaults', () => {
    it('should initialize default settings', async () => {
      (settingsRepository.findCategoriesByTenant as jest.Mock).mockResolvedValue([]);
      (settingsRepository.create as jest.Mock).mockResolvedValue({} as any);

      const result = await service.initializeDefaults('tenant-1');

      expect(result).toBeGreaterThan(0);
    });

    it('should throw ConflictException if already initialized', async () => {
      (settingsRepository.findCategoriesByTenant as jest.Mock).mockResolvedValue(['general']);

      await expect(service.initializeDefaults('tenant-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should soft delete a setting', async () => {
      const setting = { id: 'setting-1', value: 'Test App', key: 'app_name' };

      (settingsRepository.findByTenantCategoryAndKey as jest.Mock).mockResolvedValue(setting as any);
      (settingsRepository.softDelete as jest.Mock).mockResolvedValue(undefined);

      await service.delete('tenant-1', SettingCategory.GENERAL, 'app_name', 'user-1', '127.0.0.1', 'test');

      expect(settingsRepository.softDelete).toHaveBeenCalledWith('setting-1');
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });
});
