import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProductsModule } from '../../products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let categoryRepository: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Product, ProductCategory],
          synchronize: true,
        }),
        ProductsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    const { getRepository } = require('typeorm');
    categoryRepository = getRepository(ProductCategory, moduleFixture);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products/categories (POST)', () => {
    it('should create a category', () => {
      const createCategoryDto = {
        name: 'Electronics',
        description: 'Electronic devices',
      };

      return request(app.getHttpServer())
        .post('/products/categories')
        .send(createCategoryDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createCategoryDto.name);
        });
    });

    it('should fail with duplicate category name', async () => {
      const createCategoryDto = {
        name: 'Electronics',
      };

      // Create first category
      await request(app.getHttpServer())
        .post('/products/categories')
        .send(createCategoryDto);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/products/categories')
        .send(createCategoryDto)
        .expect(400);
    });
  });

  describe('/products/categories (GET)', () => {
    beforeEach(async () => {
      await categoryRepository.save([
        { name: 'Electronics', tenantId: 'tenant-123' },
        { name: 'Clothing', tenantId: 'tenant-123' },
        { name: 'Books', tenantId: 'tenant-123' },
      ]);
    });

    it('should return all categories', () => {
      return request(app.getHttpServer())
        .get('/products/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/products/categories/:id (PATCH)', () => {
    it('should update a category', async () => {
      const category = await categoryRepository.findOne({ where: { tenantId: 'tenant-123' } });

      return request(app.getHttpServer())
        .patch(`/products/categories/${category.id}`)
        .send({ name: 'Updated Electronics' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Electronics');
        });
    });
  });

  describe('/products/categories/:id (DELETE)', () => {
    it('should delete an empty category', async () => {
      const category = await categoryRepository.findOne({ where: { tenantId: 'tenant-123', name: 'Books' } });

      return request(app.getHttpServer())
        .delete(`/products/categories/${category.id}`)
        .expect(204);
    });
  });
});