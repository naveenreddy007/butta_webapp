/**
 * Kitchen Module API Routes
 * 
 * This file defines all API routes for the Kitchen Module with proper
 * authentication, validation, and error handling.
 */

import { supabase } from '../lib/supabase';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

/**
 * Base API handler with authentication and error handling
 */
export class ApiHandler {
  static async handleRequest<T>(
    request: ApiRequest,
    handler: (req: ApiRequest, user: any) => Promise<T>
  ): Promise<ApiResponse<T>> {
    try {
      // Extract auth token from headers
      const authHeader = request.headers?.['authorization'];
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return {
          success: false,
          error: 'Authentication required',
          timestamp: new Date().toISOString()
        };
      }

      // Verify token and get user
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return {
          success: false,
          error: 'Invalid authentication token',
          timestamp: new Date().toISOString()
        };
      }

      // Get kitchen user profile
      const kitchenUser = await AuthService.getUserProfile(user.id);
      if (!kitchenUser) {
        return {
          success: false,
          error: 'Kitchen user profile not found',
          timestamp: new Date().toISOString()
        };
      }

      // Execute handler
      const result = await handler(request, { ...user, kitchenUser });

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check if user has required permission
   */
  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    return AuthService.hasPermission(userRole, requiredRole);
  }
}