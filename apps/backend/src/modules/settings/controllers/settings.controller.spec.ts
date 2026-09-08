import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { SettingsController } from './settings.controller';
import { SettingsService } from '../services/settings.service';
import { SettingCategory } from '../entities/settings.entity';

describe('SettingsController (Integration)', () => {
  let app: INestApplication;
  let controller: SettingsController;
  let settingsService: jest.Mocked<SettingsService>;

  beforeEach(async () => {
    settingsService = {
      getByCategory: jest.fn(),
      getByKey: jest.fn(),
      initializeDefaults: jest.fn(),
      updateCategory: jest.fn(),
      delete: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: settingsService,
        },
      ],
    }).compile();

    controller = moduleRef.get<SettingsController>(SettingsController);
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /settings/categories', () => {
    it('should return all setting categories', () => {
      const result = controller.getCategories();
      expect(result).toEqual(Object.values(SettingCategory));
    });
  });

  describe('GET /settings/:category', () => {
    it('should return settings for a category', async () => {
      const tenantId = 'tenant-1';
      const category = SettingCategory.GENERAL;
      const mockSettings = { app_name: 'Test App', timezone: 'UTC' };

      settingsService.getByCategory.mockResolvedValue(mockSettings);

      const response = await request(app.getHttpServer())
        .get(`/settings/${category}`)
        .set('x-tenant-id', tenantId)
        .expect(200);

      expect(response.body).toEqual(mockSettings);
      expect(settingsService.getByCategory).toHaveBeenCalledWith(tenantId, category);
    });
  });

  describe('GET /settings/:category/:key', () => {
    it('should return a specific setting', async () => {
      const tenantId = 'tenant-1';
      const category = SettingCategory.GENERAL;
      const key = 'app_name';
      const mockValue = 'Test App';

      settingsService.getByKey.mockResolvedValue(mockValue);

      const response = await request(app.getHttpServer())
        .get(`/settings/${category}/${key}`)
        .set('x-tenant-id', tenantId)
        .expect(200);

      expect(response.body).toEqual(mockValue);
      expect(settingsService.getByKey).toHaveBeenCalledWith(tenantId, category, key);
    });
  });

  describe('PATCH /settings/:category', () => {
    it('should update settings for a category', async () => {
      const tenantId = 'tenant-1';
      const category = SettingCategory.GENERAL;
      const updateDto = { data: { app_name: 'New Name' } };

      settingsService.updateCategory.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .patch(`/settings/${category}`)
        .set('x-tenant-id', tenantId)
        .set('x-user-id', 'user-1')
        .send(updateDto)
        .expect(204);

      expect(settingsService.updateCategory).toHaveBeenCalledWith(
        tenantId,
        category,
        updateDto.data,
        'user-1',
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('POST /settings/:category/initialize', () => {
    it('should initialize default settings', async () => {
      const tenantId = 'tenant-1';
      const category = SettingCategory.GENERAL;
      const mockResult = { message: 'Initialized 3 default settings', count: 3 };

      settingsService.initializeDefaults.mockResolvedValue(3);

      const response = await request(app.getHttpServer())
        .post(`/settings/${category}/initialize`)
        .set('x-tenant-id', tenantId)
        .expect(201);

      expect(response.body).toEqual(mockResult);
      expect(settingsService.initializeDefaults).toHaveBeenCalledWith(tenantId);
    });

    it('should return 409 if already initialized', async () => {
      const tenantId = 'tenant-1';
      const category = SettingCategory.GENERAL;

      settingsService.initializeDefaults.mockRejectedValue(
        new Error('Settings already initialized'),
      );

      await request(app.getHttpServer())
        .post(`/settings/${category}/initialize`)
        .set('x-tenant-id', tenantId)
        .expect(500);
    });
  });

  describe('DELETE /settings/:category/:key', () => {
    it('should delete a setting', async () => {
      const tenantId = 'tenant-1';
      const category = SettingCategory.GENERAL;
      const key = 'app_name';

      settingsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/settings/${category}/${key}`)
        .set('x-tenant-id', tenantId)
        .set('x-user-id', 'user-1')
        .expect(204);

      expect(settingsService.delete).toHaveBeenCalledWith(
        tenantId,
        category,
        key,
        'user-1',
        expect.any(String),
        expect.any(String),
      );
    });

    it('should return 404 when setting not found', async () => {
      const tenantId = 'tenant-1';
      const category = SettingCategory.GENERAL;
      const key = 'nonexistent';

      settingsService.delete.mockRejectedValue(new Error('Setting not found'));

      await request(app.getHttpServer())
        .delete(`/settings/${category}/${key}`)
        .set('x-tenant-id', tenantId)
        .expect(500);
    });
  });
});
