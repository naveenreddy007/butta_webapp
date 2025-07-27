// Supabase configuration for Kitchen Module

import { createClient } from '@supabase/supabase-js';
import { KitchenUser } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Auth utilities
export const authUtils = {
  // Sign in with email/password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with OTP
  async signInWithOTP(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Only allow existing kitchen staff
      },
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get user profile with kitchen role
  async getUserProfile(userId: string): Promise<KitchenUser | null> {
    const { data, error } = await supabase
      .from('kitchen_users')
      .select('*')
      .eq('id', userId)
      .eq('isActive', true)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  // Check if user has required role
  hasRole(user: KitchenUser | null, requiredRoles: KitchenUser['role'][]): boolean {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  },

  // Role hierarchy check
  canAccess(userRole: KitchenUser['role'], requiredRole: KitchenUser['role']): boolean {
    const roleHierarchy = {
      'CHEF': 1,
      'KITCHEN_MANAGER': 2,
      'ADMIN': 3,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  },
};

// Real-time subscriptions
export const realtimeUtils = {
  // Subscribe to cooking status updates
  subscribeToCookingUpdates(eventId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`cooking-updates-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kitchen_cooking_logs',
          filter: `eventId=eq.${eventId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to indent updates
  subscribeToIndentUpdates(indentId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`indent-updates-${indentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kitchen_indents',
          filter: `id=eq.${indentId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to stock updates
  subscribeToStockUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('stock-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kitchen_stock',
        },
        callback
      )
      .subscribe();
  },

  // Unsubscribe from channel
  unsubscribe(channel: any) {
    return supabase.removeChannel(channel);
  },
};

// Database utilities
export const dbUtils = {
  // Generic query with error handling
  async query<T>(queryFn: () => Promise<any>): Promise<{ data: T | null; error: any }> {
    try {
      const result = await queryFn();
      return { data: result.data, error: result.error };
    } catch (error) {
      console.error('Database query error:', error);
      return { data: null, error };
    }
  },

  // Batch operations
  async batchInsert(table: string, records: any[]) {
    const { data, error } = await supabase
      .from(table)
      .insert(records)
      .select();
    
    return { data, error };
  },

  // Batch update
  async batchUpdate(table: string, updates: { id: string; [key: string]: any }[]) {
    const promises = updates.map(update => 
      supabase
        .from(table)
        .update(update)
        .eq('id', update.id)
    );

    const results = await Promise.all(promises);
    return results;
  },
};

// Error handling
export const handleSupabaseError = (error: any) => {
  if (error?.code === 'PGRST116') {
    return 'No data found';
  }
  if (error?.code === '23505') {
    return 'This record already exists';
  }
  if (error?.code === '23503') {
    return 'Cannot delete: record is being used elsewhere';
  }
  
  return error?.message || 'An unexpected error occurred';
};