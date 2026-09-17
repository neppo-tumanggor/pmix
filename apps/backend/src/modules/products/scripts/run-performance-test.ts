import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { PerformanceSeedService } from './seed-performance';
import { PerformanceTestService } from './performance-test';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { createConnection } from '../../../../data-source';

const TENANT_ID = 'perf-test-tenant';

async function main() {
  console.log('🚀 Product Module Performance Test');
  console.log('='.repeat(80));
  console.log(`Tenant ID: ${TENANT_ID}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(80));

  // Create data source
  const dataSource = createConnection;
  
  // Initialize services
  const seedService = new PerformanceSeedService(dataSource);
  const testService = new PerformanceTestService(dataSource, 
    new (require('../repositories/products.repository').ProductsRepository)(dataSource.getRepository(Product))
  );

  try {
    // Step 1: Clear existing data
    await seedService.clearAll(TENANT_ID);

    // Step 2: Seed with large dataset
    console.log('\n📊 SEEDING DATABASE');
    console.log('='.repeat(80));
    
    const seedConfig = {
      productCount: 10000,
      categoryCount: 20,
      tenantId: TENANT_ID,
    };

    const seedResult = await seedService.seed(seedConfig);
    
    console.log('\n✅ Database seeded successfully!');
    console.log(`   Products: ${seedResult.products.toLocaleString()}`);
    console.log(`   Categories: ${seedResult.categories}`);
    console.log(`   Duration: ${seedResult.duration}ms`);

    // Step 3: Run performance tests
    console.log('\n\n🧪 RUNNING PERFORMANCE TESTS');
    console.log('='.repeat(80));
    
    const testResults = await testService.runAllTests(TENANT_ID);

    // Step 4: Generate report
    console.log('\n\n📄 GENERATING REPORT');
    console.log('='.repeat(80));
    
    const report = {
      timestamp: new Date().toISOString(),
      tenantId: TENANT_ID,
      dataset: seedConfig,
      seedDuration: seedResult.duration,
      tests: testResults,
      summary: {
        totalTests: testResults.length,
        avgDuration: Math.round(testResults.reduce((a, b) => a + b.duration, 0) / testResults.length),
        fastestTest: testResults.reduce((a, b) => a.duration < b.duration ? a : b),
        slowestTest: testResults.reduce((a, b) => a.duration > b.duration ? a : b),
      }
    };

    console.log('\n📊 Summary:');
    console.log(`   Total tests: ${report.summary.totalTests}`);
    console.log(`   Average duration: ${report.summary.avgDuration}ms`);
    console.log(`   Fastest: ${report.summary.fastestTest.testName} (${report.summary.fastestTest.duration}ms)`);
    console.log(`   Slowest: ${report.summary.slowestTest.testName} (${report.summary.slowestTest.duration}ms)`);

    console.log('\n✅ Performance test completed successfully!');
    console.log('\n📝 Report saved to: performance-report.json');
    
    // Save report
    const fs = require('fs');
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('🎉 All tests passed!');
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Performance test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };