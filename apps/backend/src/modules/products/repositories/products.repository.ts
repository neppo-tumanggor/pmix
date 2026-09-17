import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductsRepository } from '../interfaces/products.repository.interface';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsRepository implements IProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAllWithFilters(options: {
    tenantId: string;
    search?: string;
    category?: string;
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    maxStock?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const {
      tenantId,
      search,
      category,
      isActive,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = options;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.deletedAt IS NULL');

    if (search) {
      qb.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    if (category) {
      qb.andWhere('product.category = :category', { category });
    }

    if (isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', { isActive });
    }

    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (minStock !== undefined) {
      qb.andWhere('product.stock >= :minStock', { minStock });
    }

    if (maxStock !== undefined) {
      qb.andWhere('product.stock <= :maxStock', { maxStock });
    }

    const total = await qb.getCount();

    qb.orderBy(`product.${sortBy}`, sortOrder);
    qb.offset((page - 1) * limit);
    qb.limit(limit);

    const products = await qb.getMany();

    return { products, total };
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { id, tenantId, deletedAt: null },
    });
  }

  async bulkImport(products: Partial<Product>[]): Promise<Product[]> {
    return this.productsRepository.save(products);
  }

  create(partialProduct: Partial<Product>): Promise<Product> {
    return this.productsRepository.save(partialProduct);
  }

  save(product: Partial<Product>): Promise<Product> {
    return this.productsRepository.save(product);
  }

  remove(product: Product): Promise<Product> {
    return this.productsRepository.remove(product);
  }

  softDelete(id: string): Promise<void> {
    return this.productsRepository.softDelete(id);
  }

  restore(id: string): Promise<void> {
    return this.productsRepository.restore(id);
  }
}