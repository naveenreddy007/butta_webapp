'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ChefHat,
  MessageSquare,
  Timer,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CookingLog, UpdateCookingStatusForm } from '../types';
import { KitchenService } from '../services/kitchen.service';
import { realtimeUtils } from '../lib/supabase';

interface CookingBoardProps {
  eventId: string;
  userId: string;
  userRole: string;
}

interface CookingCardProps {
  task: CookingLog;
  onUpdate: (task: CookingLog) => void;
  canEdit: boolean;
}

const CookingCard: React.FC<CookingCardProps> = ({ task, onUpdate, canEdit }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const [estimatedTime, setEstimatedTime] = useState(task.estimatedTime || 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300';
      case 'ON_HOLD': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const updateStatus = async (newStatus: CookingLog['status']) => {
    if (!canEdit) return;

    setIsUpdating(true);
    try {
      const form: UpdateCookingStatusForm = {
        id: task.id,
        status: newStatus,
        notes: notes.trim() || undefined,
        estimatedTime: estimatedTime > 0 ? estimatedTime : undefined
      };

      const updatedTask = await KitchenService.updateCookingStatus(form, task.assignedTo);
      onUpdate(updatedTask);
      setShowNotes(false);
    } catch (error) {
      console.error('Failed to update cooking status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getElapsedTime = () => {
    if (!task.startedAt) return null;
    
    const start = new Date(task.startedAt);
    const end = task.completedAt ? new Date(task.completedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    return diffMins;
  };

  const elapsedTime = getElapsedTime();

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      task.priority === 'URGENT' ? 'ring-2 ring-red-500' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{task.dishName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{task.category}</span>
              <span>•</span>
              <span>{task.servings} servings</span>
              {task.chef && (
                <>
                  <span>•</span>
                  <span className="flex items-center">
                    <ChefHat className="w-3 h-3 mr-1" />
                    {task.chef.name}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} title={`${task.priority} priority`}></div>
            <Badge className={getStatusColor(task.status)} size="sm">
              {getStatusIcon(task.status)}
              <span className="ml-1">{task.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timing Info */}
        {(task.startedAt || task.estimatedTime) && (
          <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-4">
              {task.estimatedTime && (
                <span className="flex items-center">
                  <Timer className="w-4 h-4 mr-1" />
                  Est: {task.estimatedTime}m
                </span>
              )}
              {elapsedTime !== null && (
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Elapsed: {elapsedTime}m
                </span>
              )}
            </div>
            {task.startedAt && (
              <span>
                Started: {new Date(task.startedAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm text-blue-800">{task.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {canEdit && (
          <div className="space-y-3">
            {/* Status Update Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {task.status === 'NOT_STARTED' && (
                <Button
                  onClick={() => updateStatus('IN_PROGRESS')}
                  disabled={isUpdating}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Cooking
                </Button>
              )}

              {task.status === 'IN_PROGRESS' && (
                <>
                  <Button
                    onClick={() => updateStatus('COMPLETED')}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                  <Button
                    onClick={() => updateStatus('ON_HOLD')}
                    disabled={isUpdating}
                    variant="outline"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Hold
                  </Button>
                </>
              )}

              {task.status === 'ON_HOLD' && (
                <Button
                  onClick={() => updateStatus('IN_PROGRESS')}
                  disabled={isUpdating}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}

              {task.status !== 'COMPLETED' && (
                <Button
                  onClick={() => setShowNotes(!showNotes)}
                  variant="outline"
                  size="sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              )}
            </div>

            {/* Notes Input */}
            {showNotes && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add cooking notes, special instructions, etc."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min="0"
                    value={estimatedTime || ''}
                    onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => updateStatus(task.status)}
                    disabled={isUpdating}
                    size="sm"
                  >
                    Save Note
                  </Button>
                  <Button
                    onClick={() => setShowNotes(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completion Info */}
        {task.status === 'COMPLETED' && task.completedAt && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Completed at {new Date(task.completedAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
              {elapsedTime && ` (took ${elapsedTime} minutes)`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CookingBoard: React.FC<CookingBoardProps> = ({ eventId, userId, userRole }) => {
  const [tasks, setTasks] = useState<CookingLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cooking tasks
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const timeline = await KitchenService.getCookingTimeline(eventId);
        setTasks(timeline);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cooking tasks');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [eventId]);

  // Real-time updates
  useEffect(() => {
    const channel = realtimeUtils.subscribeToCookingUpdates(eventId, (payload) => {
      if (payload.eventType === 'UPDATE') {
        setTasks(prev => prev.map(task => 
          task.id === payload.new.id ? { ...task, ...payload.new } : task
        ));
      }
    });

    return () => {
      realtimeUtils.unsubscribe(channel);
    };
  }, [eventId]);

  const handleTaskUpdate = (updatedTask: CookingLog) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const canEditTask = (task: CookingLog) => {
    return userRole === 'ADMIN' || 
           userRole === 'KITCHEN_MANAGER' || 
           (userRole === 'CHEF' && task.assignedTo === userId);
  };

  // Group tasks by status
  const groupedTasks = {
    NOT_STARTED: tasks.filter(task => task.status === 'NOT_STARTED'),
    IN_PROGRESS: tasks.filter(task => task.status === 'IN_PROGRESS'),
    ON_HOLD: tasks.filter(task => task.status === 'ON_HOLD'),
    COMPLETED: tasks.filter(task => task.status === 'COMPLETED')
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Tasks</h3>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cooking Tasks</h3>
          <p className="text-gray-600">No dishes have been assigned for cooking yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Cooking Progress</CardTitle>
          <CardDescription>
            Track the status of all dishes for this event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{groupedTasks.NOT_STARTED.length}</div>
              <div className="text-sm text-gray-500">Not Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{groupedTasks.IN_PROGRESS.length}</div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{groupedTasks.ON_HOLD.length}</div>
              <div className="text-sm text-gray-500">On Hold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{groupedTasks.COMPLETED.length}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cooking Tasks by Status */}
      <div className="space-y-6">
        {/* Not Started */}
        {groupedTasks.NOT_STARTED.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-600" />
              Not Started ({groupedTasks.NOT_STARTED.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedTasks.NOT_STARTED.map(task => (
                <CookingCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  canEdit={canEditTask(task)}
                />
              ))}
            </div>
          </div>
        )}

        {/* In Progress */}
        {groupedTasks.IN_PROGRESS.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Play className="w-5 h-5 mr-2 text-yellow-600" />
              In Progress ({groupedTasks.IN_PROGRESS.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedTasks.IN_PROGRESS.map(task => (
                <CookingCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  canEdit={canEditTask(task)}
                />
              ))}
            </div>
          </div>
        )}

        {/* On Hold */}
        {groupedTasks.ON_HOLD.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Pause className="w-5 h-5 mr-2 text-red-600" />
              On Hold ({groupedTasks.ON_HOLD.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedTasks.ON_HOLD.map(task => (
                <CookingCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  canEdit={canEditTask(task)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {groupedTasks.COMPLETED.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Completed ({groupedTasks.COMPLETED.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedTasks.COMPLETED.map(task => (
                <CookingCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  canEdit={canEditTask(task)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookingBoard;