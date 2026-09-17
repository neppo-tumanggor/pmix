import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';
import AppDataSource from '../../../data-source';

const TENANT_ID = 'perf-test-tenant';
const PRODUCT_COUNT = 10000;
const CATEGORY_COUNT = 20;

async function main() {
  console.log('\n🚀 Product Module Performance Test');
  console.log('='.repeat(80));
  console.log('Tenant ID: ' + TENANT_ID);
  console.log('Products: ' + PRODUCT_COUNT.toLocaleString());
  console.log('Categories: ' + CATEGORY_COUNT);
  console.log('='.repeat(80));

  const dataSource = AppDataSource;
  await dataSource.initialize();
  
  // Create tables if they don't exist
  console.log('Creating database tables...');
  await dataSource.synchronize(true);
  console.log('✓ Tables created');

  try {
    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await dataSource.getRepository(Product).createQueryBuilder()
      .delete()
      .where('tenant_id = :tenantId', { tenantId: TENANT_ID })
      .execute();
    await dataSource.getRepository(ProductCategory).createQueryBuilder()
      .delete()
      .where('tenant_id = :tenantId', { tenantId: TENANT_ID })
      .execute();
    console.log('✓ Data cleared');

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
          : categoryNames[i % categoryNames.length] + ' ' + (Math.floor(i / categoryNames.length) + 1),
        tenantId: TENANT_ID,
        description: 'Category ' + (i + 1),
      });
      categories.push(category);
    }

    const savedCategories = await dataSource.getRepository(ProductCategory).save(categories);
    console.log('✓ Created ' + savedCategories.length + ' categories');

    // Seed products in batches
    console.log('\n📦 Seeding products...');
    const startTime = Date.now();
    const batchSize = 1000;

    for (let batch = 0; batch < PRODUCT_COUNT / batchSize; batch++) {
      const products = [];
      const startIdx = batch * batchSize;
      const endIdx = Math.min(startIdx + batchSize, PRODUCT_COUNT);

      for (let i = startIdx; i < endIdx; i++) {
        const category = savedCategories[i % savedCategories.length];
        const product = dataSource.getRepository(Product).create({
          name: 'Product ' + (i + 1) + ' - ' + ['Amazing', 'Premium', 'Deluxe', 'Super', 'Ultra'][i % 5] + ' ' + ['Widget', 'Gadget', 'Tool', 'Device'][i % 4],
          description: 'Detailed description for product ' + (i + 1) + '.',
          price: Math.floor(Math.random() * 10000000) + 10000,
          category: category.name,
          stock: Math.floor(Math.random() * 1000),
          imageUrl: 'https://example.com/images/product-' + (i + 1) + '.jpg',
          isActive: Math.random() > 0.1,
          tenantId: TENANT_ID,
        });
        products.push(product);
      }

      await dataSource.getRepository(Product).save(products);
      console.log('  Batch ' + (batch + 1) + '/' + (PRODUCT_COUNT / batchSize) + ': ' + endIdx + ' products inserted...');
    }

    const seedDuration = Date.now() - startTime;
    console.log('✓ Seeded ' + PRODUCT_COUNT.toLocaleString() + ' products in ' + seedDuration + 'ms');

    // Run performance tests
    console.log('\n\n🧪 Running Performance Tests');
    console.log('='.repeat(80));

    const results = [];

    // Test 1: Insert Performance
    console.log('\n[TEST 1] Insert 100 Products');
    const insertStart = Date.now();
    const insertProducts = [];
    for (let i = 0; i < 100; i++) {
      const product = dataSource.getRepository(Product).create({
        name: 'Perf Test Product ' + i,
        price: Math.floor(Math.random() * 1000000),
        stock: Math.floor(Math.random() * 500),
        category: 'Electronics',
        tenantId: TENANT_ID,
        isActive: true,
      });
      insertProducts.push(product);
    }
    await dataSource.getRepository(Product).save(insertProducts);
    const insertDuration = Date.now() - insertStart;
    console.log('  ✓ 100 products inserted in ' + insertDuration + 'ms (' + Math.round(100 / (insertDuration / 1000)) + ' ops/sec)');
    results.push({ name: 'Insert 100 Products', duration: insertDuration, ops: Math.round(100 / (insertDuration / 1000)) });

    // Test 2: Simple Query
    console.log('\n[TEST 2] 50x findByIdAndTenant');
    const queryStart = Date.now();
    const productIds = await dataSource.getRepository(Product)
      .createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId: TENANT_ID })
      .limit(50)
      .getMany();
    for (const p of productIds) {
      await dataSource.getRepository(Product).findOne({ where: { id: p.id, tenantId: TENANT_ID } });
    }
    const queryDuration = Date.now() - queryStart;
    console.log('  ✓ 50 queries in ' + queryDuration + 'ms (avg: ' + (queryDuration / 50).toFixed(2) + 'ms)');
    results.push({ name: '50x findById', duration: queryDuration, ops: Math.round(50 / (queryDuration / 1000)) });

    // Test 3: Filter Query
    console.log('\n[TEST 3] Category Filter + Pagination');
    const filterStart = Date.now();
    const filterResult = await dataSource.getRepository(Product)
      .createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId: TENANT_ID })
      .andWhere('p.category = :category', { category: 'Electronics' })
      .andWhere('p.isActive = :isActive', { isActive: true })
      .orderBy('p.createdAt', 'DESC')
      .offset(0)
      .limit(50)
      .getManyAndCount();
    const filterDuration = Date.now() - filterStart;
    console.log('  ✓ Filtered in ' + filterDuration + 'ms (' + filterResult[1] + ' total, ' + filterResult[0].length + ' returned)');
    results.push({ name: 'Category Filter', duration: filterDuration, ops: Math.round(1 / (filterDuration / 1000)) });

    // Test 4: Search Query
    console.log('\n[TEST 4] LIKE Search');
    const searchStart = Date.now();
    const searchResult = await dataSource.getRepository(Product)
      .createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId: TENANT_ID })
      .andWhere('p.name LIKE :search', { search: '%Product%' })
      .getCount();
    const searchDuration = Date.now() - searchStart;
    console.log('  ✓ Search in ' + searchDuration + 'ms (' + searchResult.toLocaleString() + ' results)');
    results.push({ name: 'LIKE Search', duration: searchDuration, ops: Math.round(1 / (searchDuration / 1000)) });

    // Test 5: Count Query
    console.log('\n[TEST 5] Count Query');
    const countStart = Date.now();
    const countResult = await dataSource.getRepository(Product)
      .createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId: TENANT_ID })
      .getCount();
    const countDuration = Date.now() - countStart;
    console.log('  ✓ Count in ' + countDuration + 'ms (' + countResult.toLocaleString() + ' total products)');
    results.push({ name: 'COUNT Query', duration: countDuration, ops: Math.round(1 / (countDuration / 1000)) });

    // Print results
    console.log('\n\n' + '='.repeat(80));
    console.log('[RESULTS] PERFORMANCE TEST RESULTS');
    console.log('='.repeat(80));
    console.log('Test Name'.padEnd(50) + 'Duration'.padStart(12) + 'Ops/sec'.padStart(12));
    console.log('='.repeat(80));

    for (const result of results) {
      console.log(
        result.name.padEnd(50) + 
        (result.duration + 'ms').padStart(12) + 
        result.ops.toLocaleString().padStart(12)
      );
    }

    console.log('='.repeat(80));
    console.log('\nTotal duration: ' + (seedDuration + results.reduce((a, b) => a + b.duration, 0)) + 'ms');

    console.log('\n✅ Performance test completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Performance test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { main };
