'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { KitchenUser, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  kitchenUser: KitchenUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [kitchenUser, setKitchenUser] = useState<KitchenUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchKitchenUser(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchKitchenUser(session.user.id);
        } else {
          setKitchenUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchKitchenUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('kitchen_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching kitchen user:', error);
        return;
      }

      setKitchenUser(data);
    } catch (error) {
      console.error('Error fetching kitchen user:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setKitchenUser(null);
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!kitchenUser) return false;

    const roleHierarchy = {
      [UserRole.CHEF]: 1,
      [UserRole.KITCHEN_MANAGER]: 2,
      [UserRole.ADMIN]: 3,
    };

    return roleHierarchy[kitchenUser.role] >= roleHierarchy[requiredRole];
  };

  const value = {
    user,
    kitchenUser,
    loading,
    signIn,
    signOut,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}