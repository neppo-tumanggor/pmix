import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProductsModule } from '../../products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';
import { getRepository } from 'typeorm';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let productRepository: any;
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

    productRepository = getRepository(Product, moduleFixture);
    categoryRepository = getRepository(ProductCategory, moduleFixture);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products (POST)', () => {
    it('should create a product', () => {
      const createProductDto = {
        name: 'Test Product',
        price: 100000,
        stock: 10,
        category: 'Electronics',
      };

      return request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createProductDto.name);
          expect(res.body.price).toBe(createProductDto.price);
        });
    });

    it('should fail with invalid data', () => {
      const invalidDto = {
        name: '',
        price: -100,
        stock: -5,
      };

      return request(app.getHttpServer())
        .post('/products')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/products (GET)', () => {
    beforeEach(async () => {
      // Seed test data
      await productRepository.save([
        { name: 'Product 1', price: 100000, stock: 10, tenantId: 'tenant-123', category: 'Electronics' },
        { name: 'Product 2', price: 200000, stock: 20, tenantId: 'tenant-123', category: 'Clothing' },
        { name: 'Product 3', price: 300000, stock: 30, tenantId: 'tenant-123', category: 'Electronics' },
      ]);
    });

    it('should return all products', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.products)).toBe(true);
          expect(res.body.total).toBe(3);
        });
    });

    it('should filter products by category', () => {
      return request(app.getHttpServer())
        .get('/products?category=Electronics')
        .expect(200)
        .expect((res) => {
          expect(res.body.products.length).toBeGreaterThan(0);
          expect(res.body.products.every((p: any) => p.category === 'Electronics')).toBe(true);
        });
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return a product by id', async () => {
      const product = await productRepository.findOne({ where: { tenantId: 'tenant-123' } });

      return request(app.getHttpServer())
        .get(`/products/${product.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(product.id);
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/non-existent-id')
        .expect(404);
    });
  });

  describe('/products/:id (PATCH)', () => {
    it('should update a product', async () => {
      const product = await productRepository.findOne({ where: { tenantId: 'tenant-123' } });

      return request(app.getHttpServer())
        .patch(`/products/${product.id}`)
        .send({ price: 150000 })
        .expect(200)
        .expect((res) => {
          expect(res.body.price).toBe(150000);
        });
    });
  });

  describe('/products/:id (DELETE)', () => {
    it('should soft delete a product', async () => {
      const product = await productRepository.findOne({ where: { tenantId: 'tenant-123' } });

      return request(app.getHttpServer())
        .delete(`/products/${product.id}`)
        .expect(204);
    });
  });
});