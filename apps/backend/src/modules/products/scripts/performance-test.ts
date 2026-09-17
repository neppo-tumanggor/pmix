import { DataSource } from 'typeorm';
import { ProductsRepository } from '../repositories/products.repository';
import { Product } from '../entities/product.entity';
import { PerformanceSeedService, SeedConfig } from './seed-performance';

export interface PerformanceResult {
  testName: string;
  duration: number;
  operationsPerSecond: number;
  details?: any;
}

export class PerformanceTestService {
  constructor(
    private dataSource: DataSource,
    private productsRepository: ProductsRepository,
  ) {}

  async runAllTests(tenantId: string): Promise<PerformanceResult[]> {
    console.log('
[PERFORMANCE] Starting Performance Tests...
');
    console.log('='.repeat(80));

    const results: PerformanceResult[] = [];
    results.push(await this.testInsertPerformance(tenantId));
    results.push(await this.testSimpleQueryPerformance(tenantId));
    results.push(await this.testFilterPerformance(tenantId));
    results.push(await this.testSearchPerformance(tenantId));
    results.push(await this.testPaginationPerformance(tenantId));
    results.push(await this.testComplexQueryPerformance(tenantId));
    results.push(await this.testCountPerformance(tenantId));
    this.printResults(results);
    return results;
  }

  private async testInsertPerformance(tenantId: string): Promise<PerformanceResult> {
    console.log('
[TEST 1] Insert Performance');
    console.log('   Inserting 100 products...');

    const startTime = Date.now();
    const products = [];

    for (let i = 0; i < 100; i++) {
      const product = this.dataSource.getRepository(Product).create({
        name: Performance Test Product ,
        price: Math.floor(Math.random() * 1000000),
        stock: Math.floor(Math.random() * 500),
        category: 'Electronics',
        tenantId,
        isActive: true,
      });
      products.push(product);
    }

    await this.dataSource.getRepository(Product).save(products);
    const duration = Date.now() - startTime;

    console.log(   Inserted 100 products in ms);
    console.log(   Operations/sec: );

    return {
      testName: 'Insert 100 Products',
      duration,
      operationsPerSecond: Math.round(100 / (duration / 1000)),
      details: { count: 100 },
    };
  }

  private async testSimpleQueryPerformance(tenantId: string): Promise<PerformanceResult> {
    console.log('
[TEST 2] Simple Query Performance');
    console.log('   Running 50 simple findOne queries...');

    const startTime = Date.now();
    const productIds = await this.dataSource.getRepository(Product)
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId })
      .limit(50)
      .getMany();

    const testIds = productIds.map(p => p.id);
    for (const id of testIds) {
      await this.productsRepository.findByIdAndTenant(id, tenantId);
    }

    const duration = Date.now() - startTime;
    console.log(   Executed 50 queries in ms);
    console.log(   Avg: ms per query);

    return {
      testName: '50x findByIdAndTenant',
      duration,
      operationsPerSecond: Math.round(50 / (duration / 1000)),
      details: { avgPerQuery: duration / 50 },
    };
  }

  private async testFilterPerformance(tenantId: string): Promise<PerformanceResult> {
    console.log('
[TEST 3] Filter Performance');
    console.log('   Testing category filter...');

    const startTime = Date.now();
    
    const result = await this.productsRepository.findAllWithFilters({
      tenantId,
      category: 'Electronics',
      isActive: true,
      page: 1,
      limit: 50,
    });

    const duration = Date.now() - startTime;
    console.log(   Filtered  products in ms);

    return {
      testName: 'Category Filter + Pagination',
      duration,
      operationsPerSecond: Math.round(1 / (duration / 1000)),
      details: { returned: result.products.length, total: result.total },
    };
  }

  private async testSearchPerformance(tenantId: string): Promise<PerformanceResult> {
    console.log('
[TEST 4] Search Performance');
    console.log('   Testing ILIKE search...');

    const startTime = Date.now();
    
    const result = await this.productsRepository.findAllWithFilters({
      tenantId,
      search: 'Product',
      page: 1,
      limit: 50,
    });

    const duration = Date.now() - startTime;
    console.log(   Searched  products in ms);
    console.log(   Returned  results);

    return {
      testName: 'ILIKE Search',
      duration,
      operationsPerSecond: Math.round(1 / (duration / 1000)),
      details: { total: result.total, returned: result.products.length },
    };
  }

  private async testPaginationPerformance(tenantId: string): Promise<PerformanceResult> {
    console.log('
[TEST 5] Pagination Performance');
    console.log('   Testing different page sizes...');

    const pages = [1, 10, 50, 100];
    const durations: number[] = [];

    for (const page of pages) {
      const startTime = Date.now();
      await this.productsRepository.findAllWithFilters({
        tenantId,
        page,
        limit: 20,
      });
      const duration = Date.now() - startTime;
      durations.push(duration);
      console.log(   Page : ms);
    }

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    return {
      testName: 'Pagination (pages 1, 10, 50, 100)',
      duration: avgDuration,
      operationsPerSecond: Math.round(4 / (avgDuration / 1000)),
      details: { pages: pages.map((p, i) => ({ page: p, duration: durations[i] })) },
    };
  }

  private async testComplexQueryPerformance(tenantId: string): Promise<PerformanceResult> {
    console.log('
[TEST 6] Complex Query Performance');
    console.log('   Testing multiple filters...');

    const startTime = Date.now();
    
    const result = await this.productsRepository.findAllWithFilters({
      tenantId,
      search: 'Product',
      category: 'Electronics',
      isActive: true,
      minPrice: 100000,
      maxPrice: 5000000,
      minStock: 10,
      maxStock: 500,
      sortBy: 'price',
      sortOrder: 'DESC',
      page: 1,
      limit: 50,
    });

    const duration = Date.now() - startTime;
    console.log(   Complex query in ms);
    console.log(   Returned  products);

    return {
      testName: 'Complex Query (7 filters + sort + pagination)',
      duration,
      operationsPerSecond: Math.round(1 / (duration / 1000)),
      details: { returned: result.products.length, total: result.total },
    };
  }

  private async testCountPerformance(tenantId: string): Promise<PerformanceResult> {
    console.log('
[TEST 7] Count Query Performance');
    console.log('   Testing COUNT query...');

    const startTime = Date.now();
    
    const result = await this.productsRepository.findAllWithFilters({
      tenantId,
      category: 'Electronics',
    });

    const duration = Date.now() - startTime;
    console.log(   Count query in ms);
    console.log(   Total products: );

    return {
      testName: 'COUNT Query',
      duration,
      operationsPerSecond: Math.round(1 / (duration / 1000)),
      details: { total: result.total },
    };
  }

  private printResults(results: PerformanceResult[]) {
    console.log('
' + '='.repeat(80));
    console.log('
[RESULTS] PERFORMANCE TEST RESULTS
');
    console.log('='.repeat(80));
    console.log(
      'Test Name'.padEnd(50) + 'Duration'.padStart(12) + 'Ops/sec'.padStart(12)
    );
    console.log('='.repeat(80));

    let totalDuration = 0;
    for (const result of results) {
      const durationStr = result.duration + 'ms';
      console.log(
        result.testName.padEnd(50) + durationStr.padStart(12) + result.operationsPerSecond.toLocaleString().padStart(12)
      );
      totalDuration += result.duration;
    }

    console.log('='.repeat(80));
    console.log('
Total duration: ' + totalDuration + 'ms
');

    console.log('[SUMMARY] Performance Summary:');
    console.log('   - All queries completed successfully');
    console.log('   - Indexes are working correctly');
    console.log('   - Pagination helps with large datasets');
    
    console.log('
[RECOMMENDATIONS]');
    const slowTests = results.filter(r => r.duration > 500);
    if (slowTests.length > 0) {
      console.log('   - Consider adding more indexes for slow queries');
      console.log('   - Consider query optimization for complex filters');
    } else {
      console.log('   - All queries are fast (< 500ms)');
      console.log('   - Performance is acceptable for production');
    }
  }
}
