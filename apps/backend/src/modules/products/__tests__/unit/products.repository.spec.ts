import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsRepository } from '../../repositories/products.repository';
import { Product } from '../../entities/product.entity';
import { Repository } from 'typeorm';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let mockProductRepository: Partial<Repository<Product>>;

  beforeEach(() => {
    mockProductRepository = {
      createQueryBuilder: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
        getCount: vi.fn().mockResolvedValue(0),
      }),
      findOne: vi.fn(),
      save: vi.fn(),
      softDelete: vi.fn(),
      restore: vi.fn(),
    };

    repository = new ProductsRepository(mockProductRepository as Repository<Product>);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});