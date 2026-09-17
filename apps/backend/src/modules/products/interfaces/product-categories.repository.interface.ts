import { Repository } from 'typeorm';
import { ProductCategory } from '../entities/product-category.entity';

export interface IProductCategoriesRepository extends Repository<ProductCategory> {
  findByTenant(tenantId: string): Promise<ProductCategory[]>;

  findByIdAndTenant(id: string, tenantId: string): Promise<ProductCategory | null>;

  findHierarchy(tenantId: string): Promise<ProductCategory[]>;

  findByNameAndTenant(name: string, tenantId: string): Promise<ProductCategory | null>;

  hasProducts(categoryId: string): Promise<boolean>;
}