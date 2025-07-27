import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  ChefHat, 
  AlertTriangle, 
  CheckCircle,
  Package,
  Eye,
  Play
} from 'lucide-react';
import { KitchenService } from './services/kitchen.service';
import type { DashboardData, User } from './types';

const KitchenDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user for demo
  const mockUser: User = {
    id: 'demo-chef-id',
    email: 'chef.ravi@buttakitchen.com',
    name: 'Chef Ravi Kumar',
    role: 'CHEF',
    phone: '+91 9876543210',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await KitchenService.getDashboardData(mockUser.id, mockUser.role);
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'ON_HOLD': return 'bg-red-100 text-red-800';
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'INDENT_CREATED': return 'bg-purple-100 text-purple-800';
      case 'COOKING_STARTED': return 'bg-orange-100 text-orange-800';
      case 'COOKING_COMPLETED': return 'bg-green-100 text-green-800';
      case 'EVENT_COMPLETED': return 'bg-gray-100 text-gray-800';
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
        <div className="border border-red-200 bg-red-50 rounded-lg">
          <div className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        </div>
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
            Welcome back, {mockUser.name}! Here's what's happening today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Events</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Dishes</p>
                <p className="text-3xl font-bold text-green-600">{dashboardData.stats.completedDishes}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-yellow-600">{dashboardData.stats.pendingDishes}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Alerts</p>
                <p className="text-3xl font-bold text-red-600">{dashboardData.stats.stockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Events */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Today's Events
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Events scheduled for today that need kitchen preparation
          </p>
        </div>
        <div className="p-6">
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
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status.replace('_', ' ')}
                      </span>
                      <button
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        onClick={() => alert(`View event: ${event.name}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Cooking Tasks */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChefHat className="w-5 h-5 mr-2" />
            Active Cooking Tasks
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Dishes currently being prepared or ready to start
          </p>
        </div>
        <div className="p-6">
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
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
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
                    <button
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      onClick={() => alert(`Update cooking task: ${task.dishName}`)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Alerts */}
      {dashboardData.lowStockItems.length > 0 && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg shadow-sm">
          <div className="p-6 border-b border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Stock Alerts
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Items running low in stock
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.lowStockItems.map((item) => (
                <div key={item.id} className="bg-white border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{item.itemName}</h4>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-red-600 font-medium">
                      {item.quantity} {item.unit} left
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 border">
                      Min: {item.minStock} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600 mt-1">
            Common tasks and shortcuts
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              className="h-20 flex flex-col items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => alert('Create Indent feature coming soon!')}
            >
              <Package className="w-6 h-6 mb-2 text-gray-600" />
              <span className="text-sm text-gray-700">Create Indent</span>
            </button>
            
            <button
              className="h-20 flex flex-col items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => alert('Update Cooking feature coming soon!')}
            >
              <ChefHat className="w-6 h-6 mb-2 text-gray-600" />
              <span className="text-sm text-gray-700">Update Cooking</span>
            </button>
            
            <button
              className="h-20 flex flex-col items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => alert('Check Stock feature coming soon!')}
            >
              <Package className="w-6 h-6 mb-2 text-gray-600" />
              <span className="text-sm text-gray-700">Check Stock</span>
            </button>
            
            <button
              className="h-20 flex flex-col items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => alert('View Reports feature coming soon!')}
            >
              <Eye className="w-6 h-6 mb-2 text-gray-600" />
              <span className="text-sm text-gray-700">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;