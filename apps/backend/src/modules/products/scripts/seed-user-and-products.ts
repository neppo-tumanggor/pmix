import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { User, UserRole } from '../../auth/entities/user.entity';
import AppDataSource from '../../../data-source';

const TENANT_ID = 'default-tenant';
const PRODUCT_COUNT = 10000;
const CATEGORY_COUNT = 20;

async function main() {
  console.log('\n🚀 Seed User + Products for Development');
  console.log('='.repeat(80));
  console.log(`Tenant ID: ${TENANT_ID}`);
  console.log(`Products: ${PRODUCT_COUNT.toLocaleString()}`);
  console.log(`Categories: ${CATEGORY_COUNT}`);
  console.log('='.repeat(80));

  const dataSource = AppDataSource;
  await dataSource.initialize();

  // Create tables if they don't exist
  console.log('\n📦 Creating database tables...');
  await dataSource.synchronize(true);
  console.log('✓ Tables created');

  try {
    // Create or update user
    console.log('\n👤 Creating development user...');
    const userRepository = dataSource.getRepository(User);
    
    let user = await userRepository.findOne({ 
      where: { email: 'admin@pmix.com' } 
    });

    if (!user) {
      user = userRepository.create({
        email: 'admin@pmix.com',
        password: '$2b$10$gqXMt/McF5WwXOAf/hG5bOEOqZfrTjv9sg2bkg04.uMbyh91b2yTi', // admin123
        name: 'Admin User',
        role: UserRole.ADMIN,
        emailVerified: true,
        status: 'active',
        tenantId: TENANT_ID,
      });
      user = await userRepository.save(user);
      console.log(`✓ Created user: ${user.email} (${user.role})`);
    } else {
      // Update password in case it was seeded with an invalid hash
      user.password = '$2b$10$gqXMt/McF5WwXOAf/hG5bOEOqZfrTjv9sg2bkg04.uMbyh91b2yTi';
      await userRepository.save(user);
      console.log(`✓ Updated password for: ${user.email}`);
    }

    // Clear existing products for this tenant
    console.log('\n🗑️  Clearing existing products...');
    await dataSource.getRepository(Product).createQueryBuilder()
      .delete()
      .where('tenant_id = :tenantId', { tenantId: TENANT_ID })
      .execute();
    await dataSource.getRepository(ProductCategory).createQueryBuilder()
      .delete()
      .where('tenant_id = :tenantId', { tenantId: TENANT_ID })
      .execute();
    console.log('✓ Products cleared');

    // Seed categories
    console.log('\n📂 Creating categories...');
    const categories = [];
    const categoryNames = [
      'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports',
      'Toys', 'Food & Beverages', 'Health & Beauty', 'Automotive', 'Office Supplies',
    ];

    for (let i = 0; i < CATEGORY_COUNT; i++) {
      const category = dataSource.getRepository(ProductCategory).create({
        name: i < categoryNames.length
          ? categoryNames[i]
          : `${categoryNames[i % categoryNames.length]} ${Math.floor(i / categoryNames.length) + 1}`,
        description: `Category ${i + 1} description`,
        tenantId: TENANT_ID,
      });
      categories.push(category);
    }

    await dataSource.getRepository(ProductCategory).save(categories);
    console.log(`✓ Created ${categories.length} categories`);

    // Seed products
    console.log('\n📦 Creating products...');
    const startTime = Date.now();
    const batchSize = 1000;
    const products: Product[] = [];

    for (let i = 0; i < PRODUCT_COUNT; i++) {
      const category = categories[i % categories.length];
      const price = Math.floor(Math.random() * 10000000) + 10000;
      const stock = Math.floor(Math.random() * 1000);

      const product = dataSource.getRepository(Product).create({
        name: `Product ${i + 1} - ${generateRandomName()}`,
        description: `This is a detailed description for product ${i + 1}. ` +
          `It includes various features and specifications that make it unique.`,
        price,
        category: category.name,
        stock,
        imageUrl: `https://example.com/images/product-${i + 1}.jpg`,
        isActive: Math.random() > 0.1,
        tenantId: TENANT_ID,
      });

      products.push(product);

      if (products.length >= batchSize) {
        await dataSource.getRepository(Product).save(products);
        console.log(`  Inserted ${i + 1} products...`);
        products.length = 0;
      }
    }

    if (products.length > 0) {
      await dataSource.getRepository(Product).save(products);
    }

    const duration = Date.now() - startTime;
    console.log(`\n✅ Seed completed in ${duration}ms`);
    console.log(`   User: admin@pmix.com / admin123`);
    console.log(`   Tenant: ${TENANT_ID}`);
    console.log(`   Products: ${PRODUCT_COUNT.toLocaleString()}`);
    console.log(`   Categories: ${CATEGORY_COUNT}`);
    console.log('='.repeat(80));
    console.log('\n🌐 Open http://localhost:1458 and login with:');
    console.log('   Email: admin@pmix.com');
    console.log('   Password: admin123\n');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

function generateRandomName(): string {
  const adjectives = ['Amazing', 'Premium', 'Deluxe', 'Super', 'Ultra', 'Pro', 'Elite', 'Classic'];
  const nouns = ['Widget', 'Gadget', 'Tool', 'Device', 'Item', 'Product', 'Thing', 'Object'];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);

  return `${adj} ${noun} ${num}`;
}

main();
