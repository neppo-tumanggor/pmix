import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductCategoriesRepository } from '../interfaces/product-categories.repository.interface';
import { ProductCategory } from '../entities/product-category.entity';

@Injectable()
export class ProductCategoriesRepository implements IProductCategoriesRepository {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoriesRepository: Repository<ProductCategory>,
  ) {}

  async findByTenant(tenantId: string): Promise<ProductCategory[]> {
    return this.categoriesRepository.find({
      where: { tenantId, deletedAt: null },
      order: { name: 'ASC' },
    });
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<ProductCategory | null> {
    return this.categoriesRepository.findOne({
      where: { id, tenantId, deletedAt: null },
    });
  }

  async findHierarchy(tenantId: string): Promise<ProductCategory[]> {
    return this.categoriesRepository.find({
      where: { tenantId, deletedAt: null },
      order: { parentId: 'ASC', name: 'ASC' },
    });
  }

  async findByNameAndTenant(name: string, tenantId: string): Promise<ProductCategory | null> {
    return this.categoriesRepository.findOne({
      where: { name, tenantId, deletedAt: null },
    });
  }

  async hasProducts(categoryId: string): Promise<boolean> {
    const result = await this.categoriesRepository
      .createQueryBuilder('category')
      .where('category.id = :categoryId', { categoryId })
      .andWhere("category.deletedAt IS NULL")
      .getCount();
    return result > 0;
  }

  create(partialCategory: Partial<ProductCategory>): Promise<ProductCategory> {
    return this.categoriesRepository.save(partialCategory);
  }

  save(category: Partial<ProductCategory>): Promise<ProductCategory> {
    return this.categoriesRepository.save(category);
  }

  softDelete(id: string): Promise<void> {
    return this.categoriesRepository.softDelete(id);
  }
}