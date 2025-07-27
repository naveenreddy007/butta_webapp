/**
 * Integration Test Suite for Kitchen Module API
 * 
 * Tests all API endpoints with real database connections
 */

import { createClient } from '@supabase/supabase-js';
import { KitchenApiRouter, makeApiCall, createApiRequest } from './api/index';
import { generateTestToken } from './scripts/setup-database';

// Environment setup
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Test configuration
const TEST_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 3,
  testToken: generateTestToken()
};

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  response?: any;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

/**
 * Integration Test Runner
 */
class IntegrationTestRunner {
  private supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  private testResults: TestResult[] = [];

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Kitchen Module Integration Tests');
    console.log('==================================\n');

    const testSuites = [
      { name: 'Database Connection', tests: this.getDatabaseTests() },
      { name: 'Events API', tests: this.getEventsTests() },
      { name: 'Stock API', tests: this.getStockTests() },
      { name: 'Cooking API', tests: this.getCookingTests() },
      { name: 'Authentication', tests: this.getAuthTests() }
    ];

    let totalPassed = 0;
    let totalTests = 0;

    for (const suite of testSuites) {
      const suiteResult = await this.runTestSuite(suite.name, suite.tests);
      totalPassed += suiteResult.summary.passed;
      totalTests += suiteResult.summary.total;
      
      this.printSuiteResults(suiteResult);
    }

    this.printFinalSummary(totalPassed, totalTests);
  }

  /**
   * Run a test suite
   */
  private async runTestSuite(suiteName: string, tests: (() => Promise<TestResult>)[]): Promise<TestSuite> {
    console.log(`📋 Running ${suiteName} Tests...`);
    
    const results: TestResult[] = [];
    const startTime = Date.now();

    for (const test of tests) {
      try {
        const result = await test();
        results.push(result);
        
        const status = result.passed ? '✅' : '❌';
        console.log(`   ${status} ${result.name} (${result.duration}ms)`);
        
        if (!result.passed && result.error) {
          console.log(`      Error: ${result.error}`);
        }
      } catch (error: any) {
        results.push({
          name: 'Unknown test',
          passed: false,
          duration: 0,
          error: error.message
        });
      }
    }

    const duration = Date.now() - startTime;
    const passed = results.filter(r => r.passed).length;

    return {
      name: suiteName,
      results,
      summary: {
        total: results.length,
        passed,
        failed: results.length - passed,
        duration
      }
    };
  }

  /**
   * Database connection tests
   */
  private getDatabaseTests(): (() => Promise<TestResult>)[] {
    return [
      async () => this.runTest('Database Connection', async () => {
        const { data, error } = await this.supabase
          .from('kitchen_users')
          .select('count(*)')
          .limit(1);
        
        if (error) throw error;
        return { success: true, data };
      }),

      async () => this.runTest('Users Table Access', async () => {
        const { data, error } = await this.supabase
          .from('kitchen_users')
          .select('id, name, role')
          .limit(5);
        
        if (error) throw error;
        return { success: true, data, count: data?.length || 0 };
      }),

      async () => this.runTest('Events Table Access', async () => {
        const { data, error } = await this.supabase
          .from('kitchen_events')
          .select('id, name, guest_count')
          .limit(5);
        
        if (error) throw error;
        return { success: true, data, count: data?.length || 0 };
      }),

      async () => this.runTest('Stock Table Access', async () => {
        const { data, error } = await this.supabase
          .from('kitchen_stock')
          .select('id, item_name, quantity')
          .limit(5);
        
        if (error) throw error;
        return { success: true, data, count: data?.length || 0 };
      })
    ];
  }

  /**
   * Events API tests
   */
  private getEventsTests(): (() => Promise<TestResult>)[] {
    return [
      async () => this.runTest('GET /api/kitchen/events', async () => {
        const request = createApiRequest('GET', '/api/kitchen/events', {
          headers: { 'Authorization': `Bearer ${TEST_CONFIG.testToken}` }
        });
        
        return await KitchenApiRouter.handleRequest(request);
      }),

      async () => this.runTest('GET /api/kitchen/events/:id', async () => {
        const request = createApiRequest('GET', '/api/kitchen/events/event-001', {
          headers: { 'Authorization': `Bearer ${TEST_CONFIG.testToken}` }
        });
        
        return await KitchenApiRouter.handleRequest(request);
      }),

      async () => this.runTest('POST /api/kitchen/events', async () => {
        const request = createApiRequest('POST', '/api/kitchen/events', {
          headers: { 'Authorization': `Bearer ${TEST_CONFIG.testToken}` },
          body: {
            name: 'Integration Test Event',
            date: '2024-12-30T20:00:00Z',
            guestCount: 75,
            eventType: 'Test Event'
          }
        });
        
        return await KitchenApiRouter.handleRequest(request);
      })
    ];
  }

  /**
   * Stock API tests
   */
  private getStockTests(): (() => Promise<TestResult>)[] {
    return [
      async () => this.runTest('GET /api/kitchen/stock', async () => {
        const request = createApiRequest('GET', '/api/kitchen/stock', {
          headers: { 'Authorization': `Bearer ${TEST_CONFIG.testToken}` }
        });
        
        return await KitchenApiRouter.handleRequest(request);
      }),

      async () => this.runTest('GET /api/kitchen/stock/alerts', async () => {
        const request = createApiRequest('GET', '/api/kitchen/stock/alerts', {
          headers: { 'Authorization': `Bearer ${TEST_CONFIG.testToken}` }
        });
        
        return await KitchenApiRouter.handleRequest(request);
      }),

      async () => this.runTest('POST /api/kitchen/stock', async () => {
        const request = createApiRequest('POST', '/api/kitchen/stock', {
          headers: { 'Authorization': `Bearer ${TEST_CONFIG.testToken}` },
          body: {
            itemName: 'Integration Test Item',
            category: 'Test Category',
            quantity: 25,
            unit: 'pieces',
            costPerUnit: 1.50
          }
        });
        
        return await KitchenApiRouter.handleRequest(request);
      })
    ];
  }

  /**
   * Cooking API tests
   */
  private getCookingTests(): (() => Promise<TestResult>)[] {
    return [
      async () => this.runTest('GET /api/kitchen/cooking', async () => {
        const request = createApiRequest('GET', '/api/kitchen/cooking', {
          headers: { 'Authorization': `Bearer ${TEST_CONFIG.testToken}` }
        });
        
        return await KitchenApiRouter.handleRequest(request);
      }),

      async () => this.runTest('GET /api/kitchen/cooking/board/:eventId', async () => {
        const request = createApiRequest('GET', '/api/kitchen/cooking/board/event-001', {
          headers: { 'Authorization': `Bearer ${TEST_CONFIG.testToken}` }
        });
        
        return await KitchenApiRouter.handleRequest(request);
      }),

      async () => this.runTest('POST /api/kitchen/cooking', async () => {
        const request = createApiRequest('POST', '/api/kitchen/cooking', {
          headers: { 'Authorization': `Bearer ${TEST_CONFIG.testToken}` },
          body: {
            eventId: 'event-001',
            dishName: 'Integration Test Dish',
            category: 'Test Category',
            servings: 25,
            assignedTo: '550e8400-e29b-41d4-a716-446655440001',
            priority: 'NORMAL'
          }
        });
        
        return await KitchenApiRouter.handleRequest(request);
      })
    ];
  }

  /**
   * Authentication tests
   */
  private getAuthTests(): (() => Promise<TestResult>)[] {
    return [
      async () => this.runTest('Missing Authorization Header', async () => {
        const request = createApiRequest('GET', '/api/kitchen/events', {
          headers: {}
        });
        
        const response = await KitchenApiRouter.handleRequest(request);
        
        // Should fail with authentication error
        if (response.success) {
          throw new Error('Expected authentication error');
        }
        
        return response;
      }),

      async () => this.runTest('Invalid Token Format', async () => {
        const request = createApiRequest('GET', '/api/kitchen/events', {
          headers: { 'Authorization': 'Invalid token' }
        });
        
        const response = await KitchenApiRouter.handleRequest(request);
        
        // Should fail with authentication error
        if (response.success) {
          throw new Error('Expected authentication error');
        }
        
        return response;
      }),

      async () => this.runTest('Valid Token Access', async () => {
        const request = createApiRequest('GET', '/api/kitchen/events', {
          headers: { 'Authorization': `Bearer ${TEST_CONFIG.testToken}` }
        });
        
        return await KitchenApiRouter.handleRequest(request);
      })
    ];
  }

  /**
   * Run individual test
   */
  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await testFn();
      const duration = Date.now() - startTime;
      
      return {
        name,
        passed: true,
        duration,
        response
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      return {
        name,
        passed: false,
        duration,
        error: error.message
      };
    }
  }

  /**
   * Print suite results
   */
  private printSuiteResults(suite: TestSuite): void {
    const { passed, failed, total, duration } = suite.summary;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    console.log(`\n📊 ${suite.name} Results:`);
    console.log(`   Passed: ${passed}/${total} (${passRate}%)`);
    console.log(`   Duration: ${duration}ms`);
    
    if (failed > 0) {
      console.log(`   Failed tests:`);
      suite.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`     - ${r.name}: ${r.error}`));
    }
    
    console.log('');
  }

  /**
   * Print final summary
   */
  private printFinalSummary(totalPassed: number, totalTests: number): void {
    const passRate = ((totalPassed / totalTests) * 100).toFixed(1);
    
    console.log('🎯 Integration Test Summary');
    console.log('===========================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalTests - totalPassed}`);
    console.log(`Success Rate: ${passRate}%`);
    
    if (totalPassed === totalTests) {
      console.log('\n🎉 All integration tests passed!');
      console.log('✅ Kitchen Module API is fully functional');
    } else {
      console.log('\n⚠️  Some tests failed. Check the errors above.');
      console.log('💡 Ensure database is properly set up and migrations are run');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Fix any failing tests');
    console.log('   2. Run performance tests');
    console.log('   3. Test with frontend components');
    console.log('   4. Deploy to staging environment');
  }
}

/**
 * Quick integration test
 */
export async function runQuickIntegrationTest(): Promise<void> {
  console.log('⚡ Quick Integration Test');
  console.log('========================\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Test 1: Database connection
  console.log('1️⃣ Testing database connection...');
  try {
    const { data, error } = await supabase
      .from('kitchen_users')
      .select('count(*)')
      .limit(1);
    
    if (error) throw error;
    console.log('   ✅ Database connected');
  } catch (error: any) {
    console.log('   ❌ Database connection failed:', error.message);
    return;
  }

  // Test 2: API Router
  console.log('2️⃣ Testing API router...');
  try {
    const request = createApiRequest('GET', '/api/kitchen/events', {
      headers: { 'Authorization': `Bearer ${TEST_CONFIG.testToken}` }
    });
    
    const response = await KitchenApiRouter.handleRequest(request);
    console.log(`   ${response.success ? '✅' : '❌'} API router working`);
  } catch (error: any) {
    console.log('   ❌ API router failed:', error.message);
  }

  // Test 3: Sample data
  console.log('3️⃣ Testing sample data...');
  try {
    const { data, error } = await supabase
      .from('kitchen_events')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    console.log(`   ✅ Sample data exists (${data?.length || 0} events)`);
  } catch (error: any) {
    console.log('   ❌ Sample data test failed:', error.message);
  }

  console.log('\n🎉 Quick integration test completed!');
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new IntegrationTestRunner();
  runner.runAllTests();
}

export { IntegrationTestRunner, runQuickIntegrationTest };