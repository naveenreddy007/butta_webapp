'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/kitchen/login' 
}: ProtectedRouteProps) {
  const { user, kitchenUser, loading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user || !kitchenUser) {
        router.push(redirectTo);
        return;
      }

      // Check role permission if required
      if (requiredRole && !hasPermission(requiredRole)) {
        router.push('/kitchen/unauthorized');
        return;
      }
    }
  }, [user, kitchenUser, loading, requiredRole, hasPermission, router, redirectTo]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center bg-gray-50\">
        <div className=\"text-center\">
          <Loader2 className=\"h-8 w-8 animate-spin mx-auto mb-4 text-orange-600\" />
          <p className=\"text-gray-600\">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or insufficient permissions
  if (!user || !kitchenUser || (requiredRole && !hasPermission(requiredRole))) {
    return null;
  }

  return <>{children}</>;
}