import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsService } from '../../products.service';
import { IProductsRepository } from '../../interfaces/products.repository.interface';
import { IProductCategoriesRepository } from '../../interfaces/product-categories.repository.interface';
import { CreateProductDto } from '../../dto/create-product.dto';
import { Product } from '../../entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductsRepository: Partial<IProductsRepository>;
  let mockCategoriesRepository: Partial<IProductCategoriesRepository>;

  beforeEach(() => {
    mockProductsRepository = {
      create: vi.fn(),
      save: vi.fn(),
      findAllWithFilters: vi.fn(),
      findByIdAndTenant: vi.fn(),
      softDelete: vi.fn(),
      restore: vi.fn(),
    };

    mockCategoriesRepository = {
      findByTenant: vi.fn(),
      findByIdAndTenant: vi.fn(),
      findHierarchy: vi.fn(),
      findByNameAndTenant: vi.fn(),
      hasProducts: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      softDelete: vi.fn(),
    };

    service = new ProductsService(
      mockProductsRepository as IProductsRepository,
      mockCategoriesRepository as IProductCategoriesRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        price: 100000,
        stock: 10,
      };

      const expectedProduct = {
        id: '123',
        ...createProductDto,
        tenantId: 'tenant-123',
        isActive: true,
        stock: 10,
      } as Product;

      vi.mocked(mockProductsRepository.create).mockReturnValue(expectedProduct as Product);
      vi.mocked(mockProductsRepository.save).mockResolvedValue(expectedProduct as Product);

      const result = await service.create('tenant-123', createProductDto);

      expect(result).toEqual(expectedProduct);
      expect(mockProductsRepository.create).toHaveBeenCalled();
      expect(mockProductsRepository.save).toHaveBeenCalled();
    });
  });
});