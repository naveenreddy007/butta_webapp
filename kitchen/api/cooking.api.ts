/**
 * Cooking API Endpoints
 * 
 * Handles all cooking-related operations for the Kitchen Module
 */

import { supabase } from '../lib/supabase';
import { ApiHandler, ApiRequest, ApiResponse } from './routes';
import { CookingLog, UserRole } from '../types';

export class CookingApi {
  /**
   * GET /api/kitchen/cooking
   * Get all cooking logs with optional filtering
   */
  static async getCookingLogs(request: ApiRequest): Promise<ApiResponse<CookingLog[]>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { status, eventId, assignedTo, priority, limit = 50, offset = 0 } = req.query || {};

      let query = supabase
        .from('kitchen_cooking_logs')
        .select(`
          *,
          event:kitchen_events(id, name, date, guest_count),
          chef:kitchen_users!assigned_to(id, name, email, role)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      if (assignedTo) {
        query = query.eq('assigned_to', assignedTo);
      }

      if (priority) {
        query = query.eq('priority', priority);
      }

      // Role-based filtering
      if (user.kitchenUser.role === UserRole.CHEF) {
        // Chefs can only see their assigned cooking tasks
        query = query.eq('assigned_to', user.id);
      }

      // Apply pagination
      query = query.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch cooking logs: ${error.message}`);
      }

      // Transform data to match CookingLog interface
      const cookingLogs: CookingLog[] = data.map(log => ({
        id: log.id,
        eventId: log.event_id,
        event: log.event ? {
          id: log.event.id,
          name: log.event.name,
          date: new Date(log.event.date),
          guestCount: log.event.guest_count,
          eventType: '',
          status: 'PLANNED'
        } : undefined,
        dishName: log.dish_name,
        category: log.category,
        servings: log.servings,
        status: log.status,
        assignedTo: log.assigned_to,
        chef: log.chef,
        startedAt: log.started_at ? new Date(log.started_at) : undefined,
        completedAt: log.completed_at ? new Date(log.completed_at) : undefined,
        estimatedTime: log.estimated_time,
        notes: log.notes,
        priority: log.priority
      }));

      return cookingLogs;
    });
  }

  /**
   * GET /api/kitchen/cooking/:id
   * Get a specific cooking log by ID
   */
  static async getCookingLogById(request: ApiRequest): Promise<ApiResponse<CookingLog>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { id } = req.params || {};

      if (!id) {
        throw new Error('Cooking log ID is required');
      }

      let query = supabase
        .from('kitchen_cooking_logs')
        .select(`
          *,
          event:kitchen_events(id, name, date, guest_count, event_type, status),
          chef:kitchen_users!assigned_to(id, name, email, role)
        `)
        .eq('id', id)
        .single();

      // Role-based access control
      if (user.kitchenUser.role === UserRole.CHEF) {
        query = query.eq('assigned_to', user.id);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Cooking log not found or access denied');
        }
        throw new Error(`Failed to fetch cooking log: ${error.message}`);
      }

      const cookingLog: CookingLog = {
        id: data.id,
        eventId: data.event_id,
        event: data.event ? {
          id: data.event.id,
          name: data.event.name,
          date: new Date(data.event.date),
          guestCount: data.event.guest_count,
          eventType: data.event.event_type,
          status: data.event.status
        } : undefined,
        dishName: data.dish_name,
        category: data.category,
        servings: data.servings,
        status: data.status,
        assignedTo: data.assigned_to,
        chef: data.chef,
        startedAt: data.started_at ? new Date(data.started_at) : undefined,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        estimatedTime: data.estimated_time,
        notes: data.notes,
        priority: data.priority
      };

      return cookingLog;
    });
  }

  /**
   * POST /api/kitchen/cooking
   * Create a new cooking task
   */
  static async createCookingTask(request: ApiRequest): Promise<ApiResponse<CookingLog>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can create cooking tasks
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to create cooking tasks');
      }

      const { eventId, dishName, category, servings, assignedTo, estimatedTime, priority, notes } = req.body || {};

      // Validate required fields
      if (!eventId || !dishName || !category || !servings || !assignedTo) {
        throw new Error('Missing required fields: eventId, dishName, category, servings, assignedTo');
      }

      if (servings < 1) {
        throw new Error('Servings must be greater than 0');
      }

      const cookingData = {
        event_id: eventId,
        dish_name: dishName,
        category,
        servings,
        status: 'NOT_STARTED',
        assigned_to: assignedTo,
        estimated_time: estimatedTime || null,
        priority: priority || 'NORMAL',
        notes: notes || null
      };

      const { data, error } = await supabase
        .from('kitchen_cooking_logs')
        .insert([cookingData])
        .select(`
          *,
          event:kitchen_events(id, name, date, guest_count, event_type, status),
          chef:kitchen_users!assigned_to(id, name, email, role)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create cooking task: ${error.message}`);
      }

      const cookingLog: CookingLog = {
        id: data.id,
        eventId: data.event_id,
        event: data.event,
        dishName: data.dish_name,
        category: data.category,
        servings: data.servings,
        status: data.status,
        assignedTo: data.assigned_to,
        chef: data.chef,
        startedAt: data.started_at ? new Date(data.started_at) : undefined,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        estimatedTime: data.estimated_time,
        notes: data.notes,
        priority: data.priority
      };

      return cookingLog;
    });
  }
}  /**

   * PATCH /api/kitchen/cooking/:id/status
   * Update cooking task status
   */
  static async updateCookingStatus(request: ApiRequest): Promise<ApiResponse<CookingLog>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { id } = req.params || {};
      const { status, notes } = req.body || {};

      if (!id) {
        throw new Error('Cooking log ID is required');
      }

      if (!status) {
        throw new Error('Status is required');
      }

      const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status value');
      }

      // Check if user has permission to update this task
      if (user.kitchenUser.role === UserRole.CHEF) {
        // Chefs can only update their own assigned tasks
        const { data: task, error: checkError } = await supabase
          .from('kitchen_cooking_logs')
          .select('assigned_to')
          .eq('id', id)
          .single();

        if (checkError || task.assigned_to !== user.id) {
          throw new Error('You can only update your own assigned cooking tasks');
        }
      }

      const updateData: any = { status };

      // Set timestamps based on status
      if (status === 'IN_PROGRESS' && !updateData.started_at) {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'COMPLETED' && !updateData.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      if (notes) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from('kitchen_cooking_logs')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          event:kitchen_events(id, name, date, guest_count, event_type, status),
          chef:kitchen_users!assigned_to(id, name, email, role)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update cooking status: ${error.message}`);
      }

      const cookingLog: CookingLog = {
        id: data.id,
        eventId: data.event_id,
        event: data.event,
        dishName: data.dish_name,
        category: data.category,
        servings: data.servings,
        status: data.status,
        assignedTo: data.assigned_to,
        chef: data.chef,
        startedAt: data.started_at ? new Date(data.started_at) : undefined,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        estimatedTime: data.estimated_time,
        notes: data.notes,
        priority: data.priority
      };

      return cookingLog;
    });
  }

  /**
   * PUT /api/kitchen/cooking/:id
   * Update a cooking task
   */
  static async updateCookingTask(request: ApiRequest): Promise<ApiResponse<CookingLog>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can fully update cooking tasks
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to update cooking tasks');
      }

      const { id } = req.params || {};
      const updates = req.body || {};

      if (!id) {
        throw new Error('Cooking log ID is required');
      }

      // Validate updates
      const allowedFields = ['dishName', 'category', 'servings', 'assignedTo', 'estimatedTime', 'priority', 'notes'];
      const updateData: any = {};

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          if (key === 'dishName') {
            updateData.dish_name = updates[key];
          } else if (key === 'assignedTo') {
            updateData.assigned_to = updates[key];
          } else if (key === 'estimatedTime') {
            updateData.estimated_time = updates[key];
          } else {
            updateData[key] = updates[key];
          }
        }
      });

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      const { data, error } = await supabase
        .from('kitchen_cooking_logs')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          event:kitchen_events(id, name, date, guest_count, event_type, status),
          chef:kitchen_users!assigned_to(id, name, email, role)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update cooking task: ${error.message}`);
      }

      const cookingLog: CookingLog = {
        id: data.id,
        eventId: data.event_id,
        event: data.event,
        dishName: data.dish_name,
        category: data.category,
        servings: data.servings,
        status: data.status,
        assignedTo: data.assigned_to,
        chef: data.chef,
        startedAt: data.started_at ? new Date(data.started_at) : undefined,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        estimatedTime: data.estimated_time,
        notes: data.notes,
        priority: data.priority
      };

      return cookingLog;
    });
  }

  /**
   * DELETE /api/kitchen/cooking/:id
   * Delete a cooking task
   */
  static async deleteCookingTask(request: ApiRequest): Promise<ApiResponse<{ message: string }>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can delete cooking tasks
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to delete cooking tasks');
      }

      const { id } = req.params || {};

      if (!id) {
        throw new Error('Cooking log ID is required');
      }

      // Check if task can be deleted (not completed)
      const { data: task, error: checkError } = await supabase
        .from('kitchen_cooking_logs')
        .select('status')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new Error(`Cooking task not found: ${checkError.message}`);
      }

      if (task.status === 'COMPLETED') {
        throw new Error('Cannot delete completed cooking tasks');
      }

      const { error } = await supabase
        .from('kitchen_cooking_logs')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete cooking task: ${error.message}`);
      }

      return { message: 'Cooking task deleted successfully' };
    });
  }

  /**
   * GET /api/kitchen/cooking/board/:eventId
   * Get cooking board data for an event (Kanban-style)
   */
  static async getCookingBoard(request: ApiRequest): Promise<ApiResponse<any>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { eventId } = req.params || {};

      if (!eventId) {
        throw new Error('Event ID is required');
      }

      // Get all cooking tasks for the event
      const { data: tasks, error } = await supabase
        .from('kitchen_cooking_logs')
        .select(`
          *,
          chef:kitchen_users!assigned_to(id, name, email)
        `)
        .eq('event_id', eventId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch cooking board: ${error.message}`);
      }

      // Group tasks by status
      const board = {
        NOT_STARTED: [],
        IN_PROGRESS: [],
        COMPLETED: [],
        ON_HOLD: [],
        CANCELLED: []
      };

      tasks.forEach(task => {
        const cookingLog: CookingLog = {
          id: task.id,
          eventId: task.event_id,
          dishName: task.dish_name,
          category: task.category,
          servings: task.servings,
          status: task.status,
          assignedTo: task.assigned_to,
          chef: task.chef,
          startedAt: task.started_at ? new Date(task.started_at) : undefined,
          completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
          estimatedTime: task.estimated_time,
          notes: task.notes,
          priority: task.priority
        };

        if (board[task.status]) {
          board[task.status].push(cookingLog);
        }
      });

      // Calculate statistics
      const totalTasks = tasks.length;
      const completedTasks = board.COMPLETED.length;
      const inProgressTasks = board.IN_PROGRESS.length;
      const urgentTasks = tasks.filter(task => task.priority === 'URGENT').length;

      return {
        board,
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          urgentTasks,
          completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
      };
    });
  }

  /**
   * POST /api/kitchen/cooking/batch
   * Create multiple cooking tasks at once
   */
  static async createBatchCookingTasks(request: ApiRequest): Promise<ApiResponse<CookingLog[]>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can create batch cooking tasks
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to create cooking tasks');
      }

      const { tasks } = req.body || {};

      if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        throw new Error('Tasks array is required');
      }

      // Validate each task
      for (const task of tasks) {
        if (!task.eventId || !task.dishName || !task.category || !task.servings || !task.assignedTo) {
          throw new Error('Each task must have eventId, dishName, category, servings, and assignedTo');
        }
      }

      // Prepare tasks data
      const tasksData = tasks.map(task => ({
        event_id: task.eventId,
        dish_name: task.dishName,
        category: task.category,
        servings: task.servings,
        status: 'NOT_STARTED',
        assigned_to: task.assignedTo,
        estimated_time: task.estimatedTime || null,
        priority: task.priority || 'NORMAL',
        notes: task.notes || null
      }));

      const { data, error } = await supabase
        .from('kitchen_cooking_logs')
        .insert(tasksData)
        .select(`
          *,
          chef:kitchen_users!assigned_to(id, name, email, role)
        `);

      if (error) {
        throw new Error(`Failed to create cooking tasks: ${error.message}`);
      }

      // Transform data
      const cookingLogs: CookingLog[] = data.map(log => ({
        id: log.id,
        eventId: log.event_id,
        dishName: log.dish_name,
        category: log.category,
        servings: log.servings,
        status: log.status,
        assignedTo: log.assigned_to,
        chef: log.chef,
        startedAt: log.started_at ? new Date(log.started_at) : undefined,
        completedAt: log.completed_at ? new Date(log.completed_at) : undefined,
        estimatedTime: log.estimated_time,
        notes: log.notes,
        priority: log.priority
      }));

      return cookingLogs;
    });
  }
}