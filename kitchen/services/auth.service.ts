import { prisma } from '../lib/prisma';
import type { User, UserRole } from '../lib/prisma';

export class AuthService {
  /**
   * Create a new kitchen user
   */
  static async createUser(userData: {
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
  }): Promise<{ data: User | null; error: any }> {
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone || null,
          isActive: true,
        },
      });

      return { data: user, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
          isActive: true,
        },
      });

      return user;
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
    updates: Partial<Pick<User, 'name' | 'phone' | 'role'>>
  ): Promise<{ data: User | null; error: any }> {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.role) updateData.role = updates.role;

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return { data: user, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });

      return users;
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
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Check if user has permission for a specific role
   */
  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      'CHEF': 1,
      'KITCHEN_MANAGER': 2,
      'ADMIN': 3,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          role,
          isActive: true,
        },
        orderBy: { name: 'asc' },
      });

      return users;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
  }
}