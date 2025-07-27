'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  ChefHat, 
  AlertTriangle, 
  CheckCircle,
  Package,
  TrendingUp,
  Eye,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KitchenService } from './services/kitchen.service';
import { authUtils, realtimeUtils } from './lib/supabase';
import { DashboardData, KitchenUser, KitchenEvent, CookingLog } from './types';
import { useRouter } from 'next/navigation';

const KitchenDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<KitchenUser | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { user: authUser } = await authUtils.getCurrentUser();
        if (!authUser) {
          router.push('/kitchen/login');
          return;
        }

        const userProfile = await authUtils.getUserProfile(authUser.id);
        if (!userProfile) {
          router.push('/kitchen/login');
          return;
        }

        setUser(userProfile);

        const data = await KitchenService.getDashboardData(authUser.id, userProfile.role);
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  // Real-time updates
  useEffect(() => {
    if (!user || !dashboardData) return;

    // Subscribe to cooking updates for today's events
    const channels = dashboardData.todaysEvents.map(event => 
      realtimeUtils.subscribeToCookingUpdates(event.id, () => {
        // Refresh dashboard data
        loadDashboard();
      })
    );

    return () => {
      channels.forEach(channel => realtimeUtils.unsubscribe(channel));
    };
  }, [user, dashboardData]);

  const loadDashboard = async () => {
    if (!user) return;
    
    try {
      const data = await KitchenService.getDashboardData(user.id, user.role);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to refresh dashboard:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'ON_HOLD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'NORMAL': return 'bg-blue-500';
      case 'LOW': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadDashboard} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Kitchen Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Here's what's happening today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Badge variant="outline" className="text-sm">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Events</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Dishes</p>
                <p className="text-3xl font-bold text-green-600">{dashboardData.stats.completedDishes}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-yellow-600">{dashboardData.stats.pendingDishes}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Alerts</p>
                <p className="text-3xl font-bold text-red-600">{dashboardData.stats.stockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Today's Events
          </CardTitle>
          <CardDescription>
            Events scheduled for today that need kitchen preparation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.todaysEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No events scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.todaysEvents.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(event.date)}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event.guestCount} guests
                        </span>
                        {event.chef && (
                          <span className="flex items-center">
                            <ChefHat className="w-4 h-4 mr-1" />
                            {event.chef.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.replace('_', ' ')}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/kitchen/indent/${event.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Cooking Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChefHat className="w-5 h-5 mr-2" />
            Active Cooking Tasks
          </CardTitle>
          <CardDescription>
            Dishes currently being prepared or ready to start
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.activeCooking.length === 0 ? (
            <div className="text-center py-8">
              <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active cooking tasks</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.activeCooking.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{task.dishName}</h4>
                      <p className="text-sm text-gray-600">{task.category} • {task.servings} servings</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      <Badge className={getStatusColor(task.status)} size="sm">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  {task.chef && (
                    <p className="text-sm text-gray-600 mb-3">
                      Assigned to: {task.chef.name}
                    </p>
                  )}
                  
                  {task.notes && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-3">
                      {task.notes}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {task.estimatedTime && `Est. ${task.estimatedTime} min`}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/kitchen/cook/${task.eventId}`)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Update
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Alerts */}
      {dashboardData.lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <Package className="w-5 h-5 mr-2" />
              Stock Alerts
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Items running low in stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.lowStockItems.map((item) => (
                <div key={item.id} className="bg-white border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{item.itemName}</h4>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-red-600 font-medium">
                      {item.quantity} {item.unit} left
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Min: {item.minStock} {item.unit}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/kitchen/stock')}
              >
                <Package className="w-4 h-4 mr-2" />
                Manage Stock
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {user?.role !== 'CHEF' && (
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push('/kitchen/indent')}
              >
                <ClipboardList className="w-6 h-6 mb-2" />
                Create Indent
              </Button>
            )}
            
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/kitchen/cook')}
            >
              <ChefHat className="w-6 h-6 mb-2" />
              Update Cooking
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/kitchen/stock')}
            >
              <Package className="w-6 h-6 mb-2" />
              Check Stock
            </Button>
            
            {user?.role === 'ADMIN' && (
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push('/kitchen/summary')}
              >
                <TrendingUp className="w-6 h-6 mb-2" />
                View Reports
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KitchenDashboard;