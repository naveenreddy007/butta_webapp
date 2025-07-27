'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  ClipboardList, 
  ChefHat, 
  Package, 
  BarChart3, 
  Menu, 
  X, 
  LogOut,
  Bell,
  User,
  ArrowLeftRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { UserProfile } from './components/auth/UserProfile';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CrossSystemNav } from './components/integration/CrossSystemNav';
import { UserRole } from './types';
import { buttaBusinessInfo } from '@/data/businessInfo';

interface KitchenLayoutProps {
  children: React.ReactNode;
}

function KitchenLayoutContent({ children }: KitchenLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { kitchenUser: user, hasPermission } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<number>(0);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { 
        href: '/kitchen', 
        icon: Home, 
        label: 'Dashboard',
        badge: null,
        roles: [UserRole.CHEF, UserRole.KITCHEN_MANAGER, UserRole.ADMIN]
      },
    ];

    if (hasPermission(UserRole.KITCHEN_MANAGER)) {
      baseItems.push({
        href: '/kitchen/indent',
        icon: ClipboardList,
        label: 'Indents',
        badge: null,
        roles: [UserRole.KITCHEN_MANAGER, UserRole.ADMIN]
      });
    }

    baseItems.push(
      {
        href: '/kitchen/cook',
        icon: ChefHat,
        label: 'Cooking',
        badge: null,
        roles: [UserRole.CHEF, UserRole.KITCHEN_MANAGER, UserRole.ADMIN]
      },
      {
        href: '/kitchen/stock',
        icon: Package,
        label: 'Stock',
        badge: notifications > 0 ? notifications : null,
        roles: [UserRole.KITCHEN_MANAGER, UserRole.ADMIN]
      }
    );

    if (hasPermission(UserRole.KITCHEN_MANAGER)) {
      baseItems.push({
        href: '/kitchen/integration',
        icon: ArrowLeftRight,
        label: 'Integration',
        badge: null,
        roles: [UserRole.KITCHEN_MANAGER, UserRole.ADMIN]
      });
    }

    if (hasPermission(UserRole.ADMIN)) {
      baseItems.push({
        href: '/kitchen/summary',
        icon: BarChart3,
        label: 'Reports',
        badge: null,
        roles: [UserRole.ADMIN]
      });
    }

    return baseItems.filter(item => 
      user && item.roles.some(role => hasPermission(role))
    );
  };

  const isActivePath = (href: string) => {
    if (href === '/kitchen') {
      return pathname === '/kitchen';
    }
    return pathname.startsWith(href);
  };

  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={buttaBusinessInfo.logo} 
              alt={buttaBusinessInfo.name}
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Kitchen</h1>
              <p className="text-xs text-gray-500">{buttaBusinessInfo.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Cross System Navigation */}
            <div className="hidden sm:block">
              <CrossSystemNav currentSystem="kitchen" className="scale-75" />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                  {notifications}
                </Badge>
              )}
            </Button>
            
            {/* User Profile */}
            <UserProfile />
            
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white shadow-lg border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <img 
              src={buttaBusinessInfo.logo} 
              alt={buttaBusinessInfo.name}
              className="h-10 w-auto mr-3"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kitchen</h1>
              <p className="text-sm text-gray-500">{buttaBusinessInfo.name}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start h-12 ${
                    isActive 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                  {item.badge && (
                    <Badge className="ml-auto bg-red-500 text-white">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center justify-center">
              <UserProfile />
            </div>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
              {/* User Info */}
              <div className="px-6 py-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);
                  
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start h-14 text-lg ${
                        isActive 
                          ? 'bg-green-600 text-white' 
                          : 'text-gray-700'
                      }`}
                      onClick={() => {
                        router.push(item.href);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="w-6 h-6 mr-4" />
                      {item.label}
                      {item.badge && (
                        <Badge className="ml-auto bg-red-500 text-white">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </nav>

              {/* Mobile User Profile */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-200">
                <div className="flex items-center justify-center">
                  <UserProfile />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function KitchenLayout({ children }: KitchenLayoutProps) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <KitchenLayoutContent>
          {children}
        </KitchenLayoutContent>
      </ProtectedRoute>
    </AuthProvider>
  );
}