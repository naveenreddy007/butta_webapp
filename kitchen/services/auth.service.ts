import { supabase } from '../lib/supabase';
import { KitchenUser, UserRole } from '../types';

export class AuthService {
  /**
   * Create a new kitchen user
   */
  static async createUser(userData: {
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
  }): Promise<{ data: KitchenUser | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('kitchen_users')
        .insert([{
          email: userData.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { 
        data: {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          phone: data.phone,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<KitchenUser | null> {
    try {
      const { data, error } = await supabase
        .from('kitchen_users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as UserRole,
        phone: data.phone,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string, 
    updates: Partial<Pick<KitchenUser, 'name' | 'phone' | 'role'>>
  ): Promise<{ data: KitchenUser | null; error: any }> {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.role) updateData.role = updates.role;

      const { data, error } = await supabase
        .from('kitchen_users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { 
        data: {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          phone: data.phone,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<KitchenUser[]> {
    try {
      const { data, error } = await supabase
        .from('kitchen_users')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error || !data) {
        return [];
      }

      return data.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        phone: user.phone,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  /**
   * Deactivate user (soft delete)
   */
  static async deactivateUser(userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('kitchen_users')
        .update({ is_active: false })
        .eq('id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Check if user has permission for a specific role
   */
  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.CHEF]: 1,
      [UserRole.KITCHEN_MANAGER]: 2,
      [UserRole.ADMIN]: 3,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: UserRole): Promise<KitchenUser[]> {
    try {
      const { data, error } = await supabase
        .from('kitchen_users')
        .select('*')
        .eq('role', role)
        .eq('is_active', true)
        .order('name');

      if (error || !data) {
        return [];
      }

      return data.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        phone: user.phone,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
  }
}