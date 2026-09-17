import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductsRepository } from './interfaces/products.repository.interface';
import { IProductCategoriesRepository } from './interfaces/product-categories.repository.interface';
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
    private readonly productsRepository: IProductsRepository,
    @InjectRepository(ProductCategory)
    private readonly categoriesRepository: IProductCategoriesRepository,
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
    const page = query.page || PRODUCT_CONSTANTS.PAGE_SIZE;
    const limit = query.limit || PRODUCT_CONSTANTS.PAGE_SIZE;

    return this.productsRepository.findAllWithFilters({
      tenantId,
      search: query.search,
      category: query.category,
      isActive: query.isActive,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      minStock: query.minStock,
      maxStock: query.maxStock,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page,
      limit,
    });
  }

  async findOne(tenantId: string, id: string): Promise<Product> {
    const product = await this.productsRepository.findByIdAndTenant(id, tenantId);
    
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
    const product = await this.productsRepository.findByIdAndTenant(id, tenantId);
    
    if (!product) {
      throw new NotFoundException({
        code: ProductErrorCodes.PRODUCT_NOT_FOUND,
        message: 'Product not found',
      });
    }

    await this.productsRepository.restore(product.id);
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
        await this.productsRepository.create({
          ...productData,
          tenantId,
        });
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          data: productData,
          error: error.message,
        });
      }
    }

    return result;
  }

  async export(tenantId: string): Promise<Product[]> {
    const { products } = await this.productsRepository.findAllWithFilters({
      tenantId,
      limit: 10000,
    });

    return products;
  }
  // Category methods
  async getCategories(tenantId: string): Promise<ProductCategory[]> {
    return this.categoriesRepository.findByTenant(tenantId);
  }

  async createCategory(tenantId: string, createCategoryDto: CreateCategoryDto): Promise<ProductCategory> {
    const existingCategory = await this.categoriesRepository.findByNameAndTenant(
      createCategoryDto.name,
      tenantId,
    );

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
    const category = await this.categoriesRepository.findByIdAndTenant(id, tenantId);

    if (!category) {
      throw new NotFoundException({
        code: ProductErrorCodes.CATEGORY_NOT_FOUND,
        message: 'Category not found',
      });
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoriesRepository.findByNameAndTenant(
        updateCategoryDto.name,
        tenantId,
      );

      if (existingCategory) {
        throw new BadRequestException({
          code: ProductErrorCodes.CATEGORY_ALREADY_EXISTS,
          message: 'Category with this name already exists',
        });
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async deleteCategory(tenantId: string, id: string): Promise<void> {
    const category = await this.categoriesRepository.findByIdAndTenant(id, tenantId);

    if (!category) {
      throw new NotFoundException({
        code: ProductErrorCodes.CATEGORY_NOT_FOUND,
        message: 'Category not found',
      });
    }

    const hasProducts = await this.categoriesRepository.hasProducts(id);
    if (hasProducts) {
      throw new BadRequestException({
        code: ProductErrorCodes.CATEGORY_HAS_PRODUCTS,
        message: 'Cannot delete category that contains products',
      });
    }

    await this.categoriesRepository.softDelete(id);
  }
}
