import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Users, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';
import KitchenService, { type CookingTask } from '../../services/kitchenService';

const CookingBoard: React.FC = () => {
  const [cookingTasks, setCookingTasks] = useState<CookingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ON_HOLD', label: 'On Hold' }
  ];

  useEffect(() => {
    loadCookingTasks();
  }, []);

  const loadCookingTasks = async () => {
    try {
      const tasks = await KitchenService.getCookingTimeline('event-1');
      setCookingTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cooking tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await KitchenService.updateCookingStatus(taskId, newStatus);
      // Update local state
      setCookingTasks(tasks => 
        tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'ON_HOLD': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NOT_STARTED': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <Play className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'ON_HOLD': return <Pause className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredTasks = selectedStatus === 'all' 
    ? cookingTasks 
    : cookingTasks.filter(task => task.status === selectedStatus);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Tasks</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadCookingTasks}
            className="px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-100"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ChefHat className="w-6 h-6 mr-2" />
            Cooking Board
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage cooking tasks in real-time
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{cookingTasks.length}</p>
            </div>
            <ChefHat className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {cookingTasks.filter(t => t.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <Play className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {cookingTasks.filter(t => t.status === 'COMPLETED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-600">
                {cookingTasks.filter(t => t.status === 'NOT_STARTED').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Cooking Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            {/* Task Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{task.dishName}</h3>
                <p className="text-sm text-gray-600">{task.category}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                  <span className="ml-1">{task.status.replace('_', ' ')}</span>
                </span>
              </div>
            </div>

            {/* Task Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>{task.servings} servings</span>
              </div>
              
              {task.estimatedTime && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Est. {task.estimatedTime} minutes</span>
                </div>
              )}
              
              {task.chef && (
                <div className="flex items-center text-sm text-gray-600">
                  <ChefHat className="w-4 h-4 mr-2" />
                  <span>{task.chef.name}</span>
                </div>
              )}
            </div>

            {/* Task Notes */}
            {task.notes && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  {task.notes}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {task.status === 'NOT_STARTED' && (
                <button
                  onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </button>
              )}
              
              {task.status === 'IN_PROGRESS' && (
                <>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'ON_HOLD')}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </button>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </button>
                </>
              )}
              
              {task.status === 'ON_HOLD' && (
                <button
                  onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </button>
              )}
              
              {task.status === 'COMPLETED' && (
                <div className="flex-1 text-center py-2 text-sm text-green-600 font-medium">
                  ✓ Completed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8">
          <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {selectedStatus === 'all' 
              ? 'No cooking tasks available' 
              : `No tasks with status: ${selectedStatus.replace('_', ' ')}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CookingBoard;