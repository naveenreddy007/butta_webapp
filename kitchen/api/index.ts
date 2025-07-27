/**
 * Kitchen Module API Router
 * 
 * Main entry point for all Kitchen Module API endpoints
 */

import { ApiRequest, ApiResponse } from './routes';
import { EventsApi } from './events.api';
import { IndentsApi } from './indents.api';
import { CookingApi } from './cooking.api';
import { StockApi } from './stock.api';

export interface ApiRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: (request: ApiRequest) => Promise<ApiResponse>;
  description: string;
}

/**
 * Kitchen API Router
 * Handles routing for all Kitchen Module API endpoints
 */
export class KitchenApiRouter {
  private static routes: ApiRoute[] = [
    // Events API
    { method: 'GET', path: '/api/kitchen/events', handler: EventsApi.getEvents, description: 'Get all events' },
    { method: 'GET', path: '/api/kitchen/events/:id', handler: EventsApi.getEventById, description: 'Get event by ID' },
    { method: 'POST', path: '/api/kitchen/events', handler: EventsApi.createEvent, description: 'Create new event' },

    // Indents API
    { method: 'GET', path: '/api/kitchen/indents', handler: IndentsApi.getIndents, description: 'Get all indents' },
    { method: 'GET', path: '/api/kitchen/indents/:id', handler: IndentsApi.getIndentById, description: 'Get indent by ID' },
    { method: 'POST', path: '/api/kitchen/indents', handler: IndentsApi.createIndent, description: 'Create new indent' },

    // Cooking API
    { method: 'GET', path: '/api/kitchen/cooking', handler: CookingApi.getCookingLogs, description: 'Get all cooking logs' },
    { method: 'GET', path: '/api/kitchen/cooking/:id', handler: CookingApi.getCookingLogById, description: 'Get cooking log by ID' },
    { method: 'POST', path: '/api/kitchen/cooking', handler: CookingApi.createCookingTask, description: 'Create new cooking task' },
    { method: 'PATCH', path: '/api/kitchen/cooking/:id/status', handler: CookingApi.updateCookingStatus, description: 'Update cooking status' },
    { method: 'PATCH', path: '/api/kitchen/cooking/:id/assign', handler: CookingApi.reassignTask, description: 'Reassign cooking task' },
    { method: 'GET', path: '/api/kitchen/cooking/board/:eventId', handler: CookingApi.getCookingBoard, description: 'Get cooking board for event' },
    { method: 'DELETE', path: '/api/kitchen/cooking/:id', handler: CookingApi.deleteCookingTask, description: 'Delete cooking task' },

    // Stock API
    { method: 'GET', path: '/api/kitchen/stock', handler: StockApi.getStock, description: 'Get all stock items' },
    { method: 'GET', path: '/api/kitchen/stock/:id', handler: StockApi.getStockById, description: 'Get stock item by ID' },
    { method: 'POST', path: '/api/kitchen/stock', handler: StockApi.createStock, description: 'Create new stock item' },
    { method: 'PUT', path: '/api/kitchen/stock/:id', handler: StockApi.updateStock, description: 'Update stock item' },
    { method: 'PATCH', path: '/api/kitchen/stock/:id/quantity', handler: StockApi.updateStockQuantity, description: 'Update stock quantity' },
    { method: 'GET', path: '/api/kitchen/stock/alerts', handler: StockApi.getStockAlerts, description: 'Get stock alerts' },
    { method: 'GET', path: '/api/kitchen/stock/categories', handler: StockApi.getStockCategories, description: 'Get stock categories' },
    { method: 'DELETE', path: '/api/kitchen/stock/:id', handler: StockApi.deleteStock, description: 'Delete stock item' }
  ];

  /**
   * Handle incoming API request
   */
  static async handleRequest(request: ApiRequest): Promise<ApiResponse> {
    try {
      const route = this.findRoute(request.method, request.url);
      
      if (!route) {
        return {
          success: false,
          error: 'Route not found',
          timestamp: new Date().toISOString()
        };
      }

      // Extract path parameters
      const params = this.extractParams(route.path, request.url);
      request.params = params;

      // Execute route handler
      return await route.handler(request);

    } catch (error: any) {
      console.error('API Router Error:', error);
      return {
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Find matching route for method and path
   */
  private static findRoute(method: string, path: string): RouteHandler | null {
    return this.routes.find(route => {
      if (route.method !== method) return false;
      return this.pathMatches(route.path, path);
    }) || null;
  }

  /**
   * Check if route path matches request path
   */
  private static pathMatches(routePath: string, requestPath: string): boolean {
    // Remove query string from request path
    const cleanRequestPath = requestPath.split('?')[0];
    
    // Convert route path to regex pattern
    const pattern = routePath
      .replace(/:[^/]+/g, '([^/]+)') // Replace :param with capture group
      .replace(/\//g, '\\/'); // Escape forward slashes
    
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(cleanRequestPath);
  }

  /**
   * Extract parameters from path
   */
  private static extractParams(routePath: string, requestPath: string): Record<string, string> {
    const params: Record<string, string> = {};
    
    // Remove query string from request path
    const cleanRequestPath = requestPath.split('?')[0];
    
    const routeParts = routePath.split('/');
    const requestParts = cleanRequestPath.split('/');
    
    routeParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.substring(1);
        params[paramName] = requestParts[index];
      }
    });
    
    return params;
  }

  /**
   * Get all available routes
   */
  static getRoutes(): RouteHandler[] {
    return [...this.routes];
  }

  /**
   * Add custom route
   */
  static addRoute(route: RouteHandler): void {
    this.routes.push(route);
  }

  /**
   * Remove route
   */
  static removeRoute(method: string, path: string): boolean {
    const index = this.routes.findIndex(route => 
      route.method === method && route.path === path
    );
    
    if (index !== -1) {
      this.routes.splice(index, 1);
      return true;
    }
    
    return false;
  }
}

/**
 * Convenience function to handle API requests
 */
export async function handleKitchenApiRequest(
  method: string,
  url: string,
  headers?: Record<string, string>,
  body?: any,
  query?: Record<string, string>
): Promise<ApiResponse> {
  const request: ApiRequest = {
    method: method as any,
    url,
    headers,
    body,
    query
  };

  return await KitchenApiRouter.handleRequest(request);
}

/**
 * Utility function to create API request from HTTP request
 */
export function createApiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  options: {
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
  } = {}
): ApiRequest {
  return {
    method,
    url,
    headers: options.headers || {},
    body: options.body,
    query: options.query || {}
  };
}

/**
 * Utility function to make API calls
 */
export async function makeApiCall(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  options: {
    body?: any;
    query?: Record<string, string>;
    token?: string;
  } = {}
): Promise<ApiResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  let url = endpoint;
  if (options.query) {
    const queryString = new URLSearchParams(options.query).toString();
    url += `?${queryString}`;
  }

  const request = createApiRequest(method, url, {
    headers,
    body: options.body,
    query: options.query
  });

  return await KitchenApiRouter.handleRequest(request);
}

// Export all API classes
export { EventsApi, IndentsApi, CookingApi, StockApi };
export * from './routes';
export * from './validation';
export * from './testing';
export * from './docs';