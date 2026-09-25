import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductErrorCodes } from './constants/error-codes.enum';
import { PRODUCT_CONSTANTS } from './constants/product.constants';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly categoriesRepository: Repository<ProductCategory>,
  ) {}

  async create(tenantId: string, createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      ...createProductDto,
      tenantId,
      isActive: createProductDto.isActive ?? true,
      stock: createProductDto.stock ?? 0,
    });

    return this.productsRepository.save(product);
  }

  async findAll(tenantId: string, query: ProductQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || PRODUCT_CONSTANTS.PAGE_SIZE;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.deletedAt IS NULL');

    if (query.search) {
      qb.andWhere('product.name ILIKE :search', { search: `%${query.search}%` });
    }

    if (query.category) {
      qb.andWhere('product.category = :category', { category: query.category });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', { isActive: query.isActive });
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.minStock !== undefined) {
      qb.andWhere('product.stock >= :minStock', { minStock: query.minStock });
    }

    if (query.maxStock !== undefined) {
      qb.andWhere('product.stock <= :maxStock', { maxStock: query.maxStock });
    }

    const total = await qb.getCount();

    qb.orderBy(`product.${query.sortBy || 'createdAt'}`, query.sortOrder || 'DESC');
    qb.offset((page - 1) * limit);
    qb.limit(limit);

    const products = await qb.getMany();

    return { products, total };
  }

  async findOne(tenantId: string, id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!product) {
      throw new NotFoundException({
        code: ProductErrorCodes.PRODUCT_NOT_FOUND,
        message: 'Product not found',
      });
    }

    return product;
  }

  async update(tenantId: string, id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(tenantId, id);

    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const product = await this.findOne(tenantId, id);
    await this.productsRepository.softDelete(product.id);
  }

  async restore(tenantId: string, id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, tenantId },
    });

    if (!product) {
      throw new NotFoundException({
        code: ProductErrorCodes.PRODUCT_NOT_FOUND,
        message: 'Product not found',
      });
    }

    await this.productsRepository.update(id, { deletedAt: null });
    return product;
  }

  async bulkImport(tenantId: string, products: Partial<Product>[]): Promise<{ success: number; failed: number; errors: any[] }> {
    const result = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const productData of products) {
      try {
        await this.productsRepository.save({
          ...productData,
          tenantId,
        });
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          data: productData,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  async export(tenantId: string): Promise<Product[]> {
    const qb = this.productsRepository
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.deletedAt IS NULL');

    return qb.getMany();
  }

  // Category methods
  async getCategories(tenantId: string): Promise<ProductCategory[]> {
    return this.categoriesRepository.find({
      where: { tenantId, deletedAt: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async createCategory(tenantId: string, createCategoryDto: CreateCategoryDto): Promise<ProductCategory> {
    const existingCategory = await this.categoriesRepository.findOne({
      where: { name: createCategoryDto.name, tenantId, deletedAt: IsNull() },
    });

    if (existingCategory) {
      throw new BadRequestException({
        code: ProductErrorCodes.CATEGORY_ALREADY_EXISTS,
        message: 'Category with this name already exists',
      });
    }

    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      tenantId,
    });

    return this.categoriesRepository.save(category);
  }

  async updateCategory(tenantId: string, id: string, updateCategoryDto: UpdateCategoryDto): Promise<ProductCategory> {
    const category = await this.categoriesRepository.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException({
        code: ProductErrorCodes.CATEGORY_NOT_FOUND,
        message: 'Category not found',
      });
    }

    const existingCategory = await this.categoriesRepository.findOne({
      where: { name: updateCategoryDto.name, tenantId, deletedAt: IsNull() },
    });

    if (existingCategory && existingCategory.id !== id) {
      throw new BadRequestException({
        code: ProductErrorCodes.CATEGORY_ALREADY_EXISTS,
        message: 'Category with this name already exists',
      });
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async deleteCategory(tenantId: string, id: string): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException({
        code: ProductErrorCodes.CATEGORY_NOT_FOUND,
        message: 'Category not found',
      });
    }

    const hasProducts = await this.productsRepository
      .createQueryBuilder('product')
      .where('product.categoryId = :categoryId', { categoryId: id })
      .andWhere('product.deletedAt IS NULL')
      .getCount();
    if (hasProducts) {
      throw new BadRequestException({
        code: ProductErrorCodes.CATEGORY_HAS_PRODUCTS,
        message: 'Cannot delete category that contains products',
      });
    }

    await this.categoriesRepository.softDelete(id);
  }
}
