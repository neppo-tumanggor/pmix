import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Settings Controller (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/settings (E2E)', () => {
    const tenantId = 'test-tenant-123';
    const userId = 'user-123';

    const getAuthHeaders = () => ({
      'x-tenant-id': tenantId,
      'x-user-id': userId,
      Authorization: 'Bearer test-token',
    });

    it('/settings/categories (GET) - should return all categories', () => {
      return request(app.getHttpServer())
        .get('/api/settings/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toContain('general');
          expect(res.body).toContain('email');
        });
    });

    it('/settings/general (POST /initialize) - should initialize default settings', async () => {
      await request(app.getHttpServer())
        .post('/api/settings/general/initialize')
        .set(getAuthHeaders())
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('Initialized');
          expect(res.body.count).toBeGreaterThan(0);
        });
    });

    it('/settings/general (GET) - should return initialized settings', async () => {
      await request(app.getHttpServer())
        .get('/api/settings/general')
        .set(getAuthHeaders())
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('app_name');
          expect(res.body).toHaveProperty('timezone');
        });
    });

    it('/settings/general/app_name (GET) - should return specific setting', async () => {
      await request(app.getHttpServer())
        .get('/api/settings/general/app_name')
        .set(getAuthHeaders())
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
        });
    });

    it('/settings/general (PATCH) - should update settings', async () => {
      const updateData = {
        data: {
          app_name: 'Updated App Name',
          timezone: 'America/New_York',
        },
      };

      await request(app.getHttpServer())
        .patch('/api/settings/general')
        .set(getAuthHeaders())
        .send(updateData)
        .expect(204);
    });

    it('/settings/general (GET after PATCH) - should return updated settings', async () => {
      await request(app.getHttpServer())
        .get('/api/settings/general')
        .set(getAuthHeaders())
        .expect(200)
        .expect((res) => {
          expect(res.body.app_name).toBe('Updated App Name');
          expect(res.body.timezone).toBe('America/New_York');
        });
    });

    it('/settings/email (POST /initialize) - should initialize email settings', async () => {
      await request(app.getHttpServer())
        .post('/api/settings/email/initialize')
        .set(getAuthHeaders())
        .expect(201);
    });

    it('/settings/general/app_name (DELETE) - should delete a setting', async () => {
      await request(app.getHttpServer())
        .delete('/api/settings/general/app_name')
        .set(getAuthHeaders())
        .expect(204);

      await request(app.getHttpServer())
        .get('/api/settings/general/app_name')
        .set(getAuthHeaders())
        .expect(404);
    });

    it('/settings/general (GET after DELETE) - should not return deleted setting', async () => {
      await request(app.getHttpServer())
        .get('/api/settings/general')
        .set(getAuthHeaders())
        .expect(200)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('app_name');
        });
    });
  });
});
