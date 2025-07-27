/**
 * Events API Endpoints
 * 
 * Handles all event-related operations for the Kitchen Module
 */

import { supabase } from '../lib/supabase';
import { ApiHandler, ApiRequest, ApiResponse } from './routes';
import { KitchenEvent, UserRole } from '../types';

export class EventsApi {
  /**
   * GET /api/kitchen/events
   * Get all events with optional filtering
   */
  static async getEvents(request: ApiRequest): Promise<ApiResponse<KitchenEvent[]>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { status, date, assignedChef, limit = 50, offset = 0 } = req.query || {};

      let query = supabase
        .from('kitchen_events')
        .select(`
          *,
          chef:kitchen_users!assigned_chef(id, name, email, role),
          indents(id, status, total_items),
          cooking_logs(id, status, dish_name)
        `)
        .order('date', { ascending: true });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (date) {
        const startDate = new Date(date as string);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        
        query = query
          .gte('date', startDate.toISOString())
          .lt('date', endDate.toISOString());
      }

      if (assignedChef) {
        query = query.eq('assigned_chef', assignedChef);
      }

      // Role-based filtering
      if (user.kitchenUser.role === UserRole.CHEF) {
        // Chefs can only see their assigned events
        query = query.eq('assigned_chef', user.id);
      }

      // Apply pagination
      query = query.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch events: ${error.message}`);
      }

      // Transform data to match KitchenEvent interface
      const events: KitchenEvent[] = data.map(event => ({
        id: event.id,
        name: event.name,
        date: new Date(event.date),
        guestCount: event.guest_count,
        eventType: event.event_type,
        status: event.status,
        menuItems: event.menu_items,
        assignedChef: event.assigned_chef,
        chef: event.chef
      }));

      return events;
    });
  }

  /**
   * GET /api/kitchen/events/:id
   * Get a specific event by ID
   */
  static async getEventById(request: ApiRequest): Promise<ApiResponse<KitchenEvent>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { id } = req.params || {};

      if (!id) {
        throw new Error('Event ID is required');
      }

      let query = supabase
        .from('kitchen_events')
        .select(`
          *,
          chef:kitchen_users!assigned_chef(id, name, email, role),
          indents(
            id, status, total_items, created_at,
            items:kitchen_indent_items(*)
          ),
          cooking_logs(
            id, dish_name, category, servings, status, 
            assigned_to, started_at, completed_at, 
            estimated_time, notes, priority,
            chef:kitchen_users!assigned_to(id, name)
          ),
          leftovers(*)
        `)
        .eq('id', id)
        .single();

      // Role-based access control
      if (user.kitchenUser.role === UserRole.CHEF) {
        query = query.eq('assigned_chef', user.id);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Event not found or access denied');
        }
        throw new Error(`Failed to fetch event: ${error.message}`);
      }

      const event: KitchenEvent = {
        id: data.id,
        name: data.name,
        date: new Date(data.date),
        guestCount: data.guest_count,
        eventType: data.event_type,
        status: data.status,
        menuItems: data.menu_items,
        assignedChef: data.assigned_chef,
        chef: data.chef
      };

      return event;
    });
  }

  /**
   * POST /api/kitchen/events
   * Create a new event
   */
  static async createEvent(request: ApiRequest): Promise<ApiResponse<KitchenEvent>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can create events
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to create events');
      }

      const { name, date, guestCount, eventType, menuItems, assignedChef } = req.body || {};

      // Validate required fields
      if (!name || !date || !guestCount || !eventType) {
        throw new Error('Missing required fields: name, date, guestCount, eventType');
      }

      if (guestCount < 1 || guestCount > 1000) {
        throw new Error('Guest count must be between 1 and 1000');
      }

      const eventData = {
        name,
        date: new Date(date).toISOString(),
        guest_count: guestCount,
        event_type: eventType,
        status: 'PLANNED',
        menu_items: menuItems || null,
        assigned_chef: assignedChef || null
      };

      const { data, error } = await supabase
        .from('kitchen_events')
        .insert([eventData])
        .select(`
          *,
          chef:kitchen_users!assigned_chef(id, name, email, role)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create event: ${error.message}`);
      }

      const event: KitchenEvent = {
        id: data.id,
        name: data.name,
        date: new Date(data.date),
        guestCount: data.guest_count,
        eventType: data.event_type,
        status: data.status,
        menuItems: data.menu_items,
        assignedChef: data.assigned_chef,
        chef: data.chef
      };

      return event;
    });
  }
}  /
**
   * PUT /api/kitchen/events/:id
   * Update an existing event
   */
  static async updateEvent(request: ApiRequest): Promise<ApiResponse<KitchenEvent>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can update events
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to update events');
      }

      const { id } = req.params || {};
      const updates = req.body || {};

      if (!id) {
        throw new Error('Event ID is required');
      }

      // Validate updates
      const allowedFields = ['name', 'date', 'guestCount', 'eventType', 'status', 'menuItems', 'assignedChef'];
      const updateData: any = {};

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          if (key === 'date') {
            updateData.date = new Date(updates[key]).toISOString();
          } else if (key === 'guestCount') {
            updateData.guest_count = updates[key];
          } else if (key === 'eventType') {
            updateData.event_type = updates[key];
          } else if (key === 'menuItems') {
            updateData.menu_items = updates[key];
          } else if (key === 'assignedChef') {
            updateData.assigned_chef = updates[key];
          } else {
            updateData[key] = updates[key];
          }
        }
      });

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      const { data, error } = await supabase
        .from('kitchen_events')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          chef:kitchen_users!assigned_chef(id, name, email, role)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update event: ${error.message}`);
      }

      const event: KitchenEvent = {
        id: data.id,
        name: data.name,
        date: new Date(data.date),
        guestCount: data.guest_count,
        eventType: data.event_type,
        status: data.status,
        menuItems: data.menu_items,
        assignedChef: data.assigned_chef,
        chef: data.chef
      };

      return event;
    });
  }

  /**
   * DELETE /api/kitchen/events/:id
   * Delete an event (soft delete by setting status to CANCELLED)
   */
  static async deleteEvent(request: ApiRequest): Promise<ApiResponse<{ message: string }>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Admins can delete events
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.ADMIN)) {
        throw new Error('Insufficient permissions to delete events');
      }

      const { id } = req.params || {};

      if (!id) {
        throw new Error('Event ID is required');
      }

      // Soft delete by updating status
      const { error } = await supabase
        .from('kitchen_events')
        .update({ status: 'CANCELLED' })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete event: ${error.message}`);
      }

      return { message: 'Event deleted successfully' };
    });
  }

  /**
   * GET /api/kitchen/events/:id/dashboard
   * Get dashboard data for a specific event
   */
  static async getEventDashboard(request: ApiRequest): Promise<ApiResponse<any>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { id } = req.params || {};

      if (!id) {
        throw new Error('Event ID is required');
      }

      // Get event with related data
      const { data: event, error: eventError } = await supabase
        .from('kitchen_events')
        .select(`
          *,
          indents(id, status, total_items),
          cooking_logs(id, status, dish_name, priority),
          leftovers(id, item_name, quantity)
        `)
        .eq('id', id)
        .single();

      if (eventError) {
        throw new Error(`Failed to fetch event dashboard: ${eventError.message}`);
      }

      // Calculate statistics
      const totalDishes = event.cooking_logs?.length || 0;
      const completedDishes = event.cooking_logs?.filter((log: any) => log.status === 'COMPLETED').length || 0;
      const inProgressDishes = event.cooking_logs?.filter((log: any) => log.status === 'IN_PROGRESS').length || 0;
      const urgentTasks = event.cooking_logs?.filter((log: any) => log.priority === 'URGENT').length || 0;

      const dashboard = {
        event: {
          id: event.id,
          name: event.name,
          date: event.date,
          guestCount: event.guest_count,
          status: event.status
        },
        stats: {
          totalDishes,
          completedDishes,
          inProgressDishes,
          urgentTasks,
          completionPercentage: totalDishes > 0 ? Math.round((completedDishes / totalDishes) * 100) : 0
        },
        indents: event.indents || [],
        recentActivity: event.cooking_logs?.slice(-5) || [],
        leftovers: event.leftovers || []
      };

      return dashboard;
    });
  }
}