/**
 * API Testing Utilities
 * 
 * Provides utilities for testing Kitchen Module API endpoints
 */
import { KitchenApiRouter, createApiRequest, ApiRequest, ApiResponse } from './index';

export interface TestCase {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  expectedStatus: 'success' | 'error';
  expectedData?: any;
  description: string;
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  response: ApiResponse;
  error?: string;
  duration: number;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
}

/**
 * API Testing utility class
 */
export class ApiTester {
  private static authToken: string | null = null;

  /**
   * Set authentication token for tests
   */
  static setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Run a single test case
   */
  static async runTest(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Prepare headers
      const headers = { ...testCase.headers };
      if (this.authToken && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      // Create API request
      const request = createApiRequest(testCase.method, testCase.endpoint, {
        headers,
        body: testCase.body,
        query: testCase.query
      });

      // Execute request
      const response = await KitchenApiRouter.handleRequest(request);
      const duration = Date.now() - startTime;

      // Check if test passed
      const passed = this.evaluateTest(testCase, response);

      return {
        testCase,
        passed,
        response,
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        testCase,
        passed: false,
        response: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        },
        error: error.message,
        duration
      };
    }
  }

  /**
   * Run multiple test cases
   */
  static async runTests(testCases: TestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      const result = await this.runTest(testCase);
      results.push(result);
    }

    return results;
  }

  /**
   * Run a test suite
   */
  static async runTestSuite(testSuite: TestSuite): Promise<{
    suiteName: string;
    results: TestResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      duration: number;
    };
  }> {
    console.log(`Running test suite: ${testSuite.name}`);
    
    const results = await this.runTests(testSuite.tests);
    const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);
    
    const summary = {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      duration: totalDuration
    };

    return {
      suiteName: testSuite.name,
      results,
      summary
    };
  }

  /**
   * Evaluate if a test passed
   */
  private static evaluateTest(testCase: TestCase, response: ApiResponse): boolean {
    // Check expected status
    if (testCase.expectedStatus === 'success' && !response.success) {
      return false;
    }
    if (testCase.expectedStatus === 'error' && response.success) {
      return false;
    }

    // Check expected data if provided
    if (testCase.expectedData && response.data) {
      return this.deepEqual(testCase.expectedData, response.data);
    }

    return true;
  }

  /**
   * Deep equality check
   */
  private static deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return false;
    
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 !== 'object') return obj1 === obj2;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  }

  /**
   * Generate test report
   */
  static generateReport(results: TestResult[]): string {
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    let report = `
API Test Report
===============
Total Tests: ${results.length}
Passed: ${passed}
Failed: ${failed}
Success Rate: ${((passed / results.length) * 100).toFixed(1)}%
Total Duration: ${totalDuration}ms

`;

    results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      report += `${index + 1}. ${status} - ${result.testCase.name} (${result.duration}ms)\n`;
      
      if (!result.passed) {
        report += `   Expected: ${result.testCase.expectedStatus}\n`;
        report += `   Got: ${result.response.success ? 'success' : 'error'}\n`;
        if (result.response.error) {
          report += `   Error: ${result.response.error}\n`;
        }
      }
      report += '\n';
    });

    return report;
  }
}

/**
 * Predefined test suites
 */
export const testSuites: TestSuite[] = [
  {
    name: 'Events API Tests',
    tests: [
      {
        name: 'Get all events',
        method: 'GET',
        endpoint: '/api/kitchen/events',
        expectedStatus: 'success',
        description: 'Should return list of events'
      },
      {
        name: 'Create new event',
        method: 'POST',
        endpoint: '/api/kitchen/events',
        body: {
          name: 'Test Event',
          date: '2024-12-01',
          guestCount: 50,
          eventType: 'Wedding',
          status: 'PLANNED'
        },
        expectedStatus: 'success',
        description: 'Should create a new event'
      },
      {
        name: 'Get event by invalid ID',
        method: 'GET',
        endpoint: '/api/kitchen/events/invalid-id',
        expectedStatus: 'error',
        description: 'Should return error for invalid event ID'
      }
    ]
  },
  {
    name: 'Stock API Tests',
    tests: [
      {
        name: 'Get all stock items',
        method: 'GET',
        endpoint: '/api/kitchen/stock',
        expectedStatus: 'success',
        description: 'Should return list of stock items'
      },
      {
        name: 'Create stock item',
        method: 'POST',
        endpoint: '/api/kitchen/stock',
        body: {
          itemName: 'Test Item',
          category: 'Vegetables',
          quantity: 100,
          unit: 'kg'
        },
        expectedStatus: 'success',
        description: 'Should create a new stock item'
      },
      {
        name: 'Get stock alerts',
        method: 'GET',
        endpoint: '/api/kitchen/stock/alerts',
        expectedStatus: 'success',
        description: 'Should return stock alerts'
      }
    ]
  },
  {
    name: 'Cooking API Tests',
    tests: [
      {
        name: 'Get cooking board',
        method: 'GET',
        endpoint: '/api/kitchen/cooking/board/test-event-id',
        expectedStatus: 'success',
        description: 'Should return cooking board data'
      },
      {
        name: 'Create cooking task with invalid data',
        method: 'POST',
        endpoint: '/api/kitchen/cooking',
        body: {
          dishName: 'Test Dish'
          // Missing required fields
        },
        expectedStatus: 'error',
        description: 'Should return error for invalid cooking task data'
      }
    ]
  }
];

/**
 * Mock data generators for testing
 */
export class MockDataGenerator {
  static generateEvent(overrides: Partial<any> = {}): any {
    return {
      name: 'Test Event',
      date: new Date().toISOString(),
      guestCount: 50,
      eventType: 'Wedding',
      status: 'PLANNED',
      ...overrides
    };
  }

  static generateStock(overrides: Partial<any> = {}): any {
    return {
      itemName: 'Test Item',
      category: 'Vegetables',
      quantity: 100,
      unit: 'kg',
      costPerUnit: 5.50,
      minStock: 10,
      ...overrides
    };
  }

  static generateCookingTask(overrides: Partial<any> = {}): any {
    return {
      eventId: 'test-event-id',
      dishName: 'Test Dish',
      category: 'Main Course',
      servings: 50,
      assignedTo: 'test-chef-id',
      priority: 'NORMAL',
      estimatedTime: 120,
      ...overrides
    };
  }

  static generateIndent(overrides: Partial<any> = {}): any {
    return {
      eventId: 'test-event-id',
      items: [
        {
          itemName: 'Tomatoes',
          category: 'Vegetables',
          quantity: 10,
          unit: 'kg'
        }
      ],
      status: 'DRAFT',
      ...overrides
    };
  }
}