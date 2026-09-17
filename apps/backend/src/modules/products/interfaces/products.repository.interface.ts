import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

export interface IProductsRepository extends Repository<Product> {
  findAllWithFilters(options: {
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
  }): Promise<{ products: Product[]; total: number }>;

  findByIdAndTenant(id: string, tenantId: string): Promise<Product | null>;

  bulkImport(products: Partial<Product>[]): Promise<Product[]>;
}