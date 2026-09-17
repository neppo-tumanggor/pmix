import { DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';

export interface SeedConfig {
  productCount: number;
  categoryCount: number;
  tenantId: string;
}

export class PerformanceSeedService {
  constructor(private dataSource: DataSource) {}

  async seed(config: SeedConfig): Promise<{
    products: number;
    categories: number;
    duration: number;
  }> {
    console.log(`🌱 Starting performance seed...`);
    console.log(`   Products: ${config.productCount.toLocaleString()}`);
    console.log(`   Categories: ${config.categoryCount}`);
    console.log(`   Tenant ID: ${config.tenantId}`);

    const startTime = Date.now();

    // Create categories first
    const categories = await this.createCategories(config.categoryCount, config.tenantId);
    console.log(`✓ Created ${categories.length} categories`);

    // Create products in batches
    const products = await this.createProducts(
      config.productCount,
      config.tenantId,
      categories,
    );
    console.log(`✓ Created ${products.length} products`);

    const duration = Date.now() - startTime;
    console.log(`✅ Seed completed in ${duration}ms`);

    return {
      products: products.length,
      categories: categories.length,
      duration,
    };
  }

  private async createCategories(count: number, tenantId: string) {
    const categories: ProductCategory[] = [];
    const categoryNames = [
      'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports',
      'Toys', 'Food & Beverages', 'Health & Beauty', 'Automotive', 'Office Supplies',
    ];

    for (let i = 0; i < count; i++) {
      const category = this.dataSource.getRepository(ProductCategory).create({
        name: i < categoryNames.length 
          ? categoryNames[i] 
          : `${categoryNames[i % categoryNames.length]} ${Math.floor(i / categoryNames.length) + 1}`,
        tenantId,
        description: `Category ${i + 1} description`,
      });
      categories.push(category);
    }

    return this.dataSource.getRepository(ProductCategory).save(categories);
  }

  private async createProducts(
    count: number,
    tenantId: string,
    categories: ProductCategory[],
  ) {
    const batchSize = 1000;
    const products: Product[] = [];

    for (let i = 0; i < count; i++) {
      const category = categories[i % categories.length];
      const price = Math.floor(Math.random() * 10000000) + 10000; // 10k - 10M
      const stock = Math.floor(Math.random() * 1000);

      const product = this.dataSource.getRepository(Product).create({
        name: `Product ${i + 1} - ${this.generateRandomName()}`,
        description: `This is a detailed description for product ${i + 1}. ` +
          `It includes various features and specifications that make it unique.`,
        price,
        category: category.name,
        stock,
        imageUrl: `https://example.com/images/product-${i + 1}.jpg`,
        isActive: Math.random() > 0.1, // 90% active
        tenantId,
      });

      products.push(product);

      // Insert in batches
      if (products.length >= batchSize) {
        await this.dataSource.getRepository(Product).save(products);
        console.log(`  Inserted ${i + 1} products...`);
        products.length = 0; // Clear array
      }
    }

    // Insert remaining products
    if (products.length > 0) {
      await this.dataSource.getRepository(Product).save(products);
    }

    return products;
  }

  private generateRandomName(): string {
    const adjectives = ['Amazing', 'Premium', 'Deluxe', 'Super', 'Ultra', 'Pro', 'Elite', 'Classic'];
    const nouns = ['Widget', 'Gadget', 'Tool', 'Device', 'Item', 'Product', 'Thing', 'Object'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1000);

    return `${adj} ${noun} ${num}`;
  }

  async clearAll(tenantId: string): Promise<void> {
    console.log('🗑️  Clearing existing data...');
    
    await this.dataSource.getRepository(Product).createQueryBuilder()
      .delete()
      .where('tenant_id = :tenantId', { tenantId })
      .execute();

    await this.dataSource.getRepository(ProductCategory).createQueryBuilder()
      .delete()
      .where('tenant_id = :tenantId', { tenantId })
      .execute();

    console.log('✓ Data cleared');
  }
}