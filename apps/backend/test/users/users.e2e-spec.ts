import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Users Controller (E2E)', () => {
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

  describe('/users/me (E2E)', () => {
    const tenantId = 'test-tenant-users';
    const userId = 'user-456';

    const getAuthHeaders = () => ({
      'x-tenant-id': tenantId,
      'x-user-id': userId,
      Authorization: 'Bearer test-token-users',
    });

    it('GET /users/me - should return user profile', async () => {
      await request(app.getHttpServer())
        .get('/api/users/me')
        .set(getAuthHeaders())
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('name');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('PATCH /users/me - should update user profile', async () => {
      const updateData = {
        name: 'John Doe Updated',
        bio: 'Software Developer',
        phone: '+1234567890',
        timezone: 'America/New_York',
        language: 'en',
        theme: 'dark',
      };

      await request(app.getHttpServer())
        .patch('/api/users/me')
        .set(getAuthHeaders())
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('John Doe Updated');
          expect(res.body.theme).toBe('dark');
        });
    });
  });

  describe('/users/me/preferences (E2E)', () => {
    const tenantId = 'test-tenant-prefs';
    const userId = 'user-789';

    const getAuthHeaders = () => ({
      'x-tenant-id': tenantId,
      'x-user-id': userId,
      Authorization: 'Bearer test-token-prefs',
    });

    it('GET /users/me/preferences - should return user preferences', async () => {
      await request(app.getHttpServer())
        .get('/api/users/me/preferences')
        .set(getAuthHeaders())
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('tenantId');
        });
    });

    it('PATCH /users/me/preferences - should update preferences', async () => {
      const preferencesData = {
        theme: 'dark',
        language: 'id',
        timezone: 'Asia/Jakarta',
        notifications_email: true,
      };

      await request(app.getHttpServer())
        .patch('/api/users/me/preferences')
        .set(getAuthHeaders())
        .send(preferencesData)
        .expect(200)
        .expect((res) => {
          expect(res.body.theme).toBe('dark');
          expect(res.body.language).toBe('id');
        });
    });
  });

  describe('/users/me/metadata (E2E)', () => {
    const tenantId = 'test-tenant-metadata';
    const userId = 'user-999';

    const getAuthHeaders = () => ({
      'x-tenant-id': tenantId,
      'x-user-id': userId,
      Authorization: 'Bearer test-token-metadata',
    });

    it('GET /users/me/metadata - should return metadata', async () => {
      await request(app.getHttpServer())
        .get('/api/users/me/metadata')
        .set(getAuthHeaders())
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(typeof res.body).toBe('object');
        });
    });

    it('POST /users/me/metadata - should set metadata', async () => {
      const metadataData = {
        key: 'favorite_color',
        value: 'blue',
      };

      await request(app.getHttpServer())
        .post('/api/users/me/metadata')
        .set(getAuthHeaders())
        .send(metadataData)
        .expect(201)
        .expect((res) => {
          expect(res.body.key).toBe('favorite_color');
          expect(res.body.value).toBe('blue');
        });
    });

    it('DELETE /users/me/metadata/:key - should delete metadata', async () => {
      await request(app.getHttpServer())
        .delete('/api/users/me/metadata/favorite_color')
        .set(getAuthHeaders())
        .expect(200);
    });
  });

  describe('Security Tests (E2E)', () => {
    it('should reject requests without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/users/me')
        .expect(401);
    });

    it('should reject requests without tenant ID', async () => {
      await request(app.getHttpServer())
        .get('/api/users/me')
        .set({ Authorization: 'Bearer test-token' })
        .expect(401);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/api/users/me')
        .set({
          'x-tenant-id': 'test-tenant',
          'x-user-id': 'non-existent-user-id',
          Authorization: 'Bearer test-token',
        })
        .expect(404);
    });
  });
});
