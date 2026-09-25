import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { ProductsService } from '../../products.service';
import type { Product } from '../../entities/product.entity';
import type { ProductCategory } from '../../entities/product-category.entity';

// Entity metadata is unrelated to pagination and requires a different decorator transform.
vi.mock('../../entities/product.entity', () => ({ Product: class Product {} }));
vi.mock('../../entities/product-category.entity', () => ({ ProductCategory: class ProductCategory {} }));

describe('product list pagination', () => {
  function setup() {
    const rows = [{ id: 'first' }, { id: 'second' }, { id: 'third' }];
    let offset = 0;
    let limit = 20;
    const queryBuilder = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getCount: vi.fn().mockResolvedValue(rows.length),
      offset: vi.fn((value: number) => { offset = value; }),
      limit: vi.fn((value: number) => { limit = value; }),
      getMany: vi.fn(async () => rows.slice(offset, offset + limit)),
    };
    const repository = { createQueryBuilder: () => queryBuilder } as unknown as Repository<Product>;
    return new ProductsService(repository, {} as Repository<ProductCategory>);
  }

  it('returns the first products when no page is requested', async () => {
    const result = await setup().findAll('tenant', {});
    expect(result.total).toBe(3);
    expect(result.products[0]).toEqual({ id: 'first' });
  });

  it('still honors an explicitly requested page and limit', async () => {
    const result = await setup().findAll('tenant', { page: 2, limit: 2 });
    expect(result).toEqual({ products: [{ id: 'third' }], total: 3 });
  });
});
