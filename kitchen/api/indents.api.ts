/**
 * Indents API Endpoints
 * 
 * Handles all indent-related operations for the Kitchen Module
 */

import { supabase } from '../lib/supabase';
import { ApiHandler, ApiRequest, ApiResponse } from './routes';
import { Indent, IndentItem, UserRole } from '../types';

export class IndentsApi {
  /**
   * GET /api/kitchen/indents
   * Get all indents with optional filtering
   */
  static async getIndents(request: ApiRequest): Promise<ApiResponse<Indent[]>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { status, eventId, limit = 50, offset = 0 } = req.query || {};

      let query = supabase
        .from('kitchen_indents')
        .select(`
          *,
          event:kitchen_events(id, name, date, guest_count),
          items:kitchen_indent_items(
            id, item_name, category, quantity, unit,
            is_in_stock, is_received, notes,
            stock:kitchen_stock(id, item_name, quantity)
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      // Role-based filtering
      if (user.kitchenUser.role === UserRole.CHEF) {
        // Chefs can only see indents for their assigned events
        query = query.in('event_id', 
          supabase
            .from('kitchen_events')
            .select('id')
            .eq('assigned_chef', user.id)
        );
      }

      // Apply pagination
      query = query.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch indents: ${error.message}`);
      }

      // Transform data to match Indent interface
      const indents: Indent[] = data.map(indent => ({
        id: indent.id,
        eventId: indent.event_id,
        event: indent.event ? {
          id: indent.event.id,
          name: indent.event.name,
          date: new Date(indent.event.date),
          guestCount: indent.event.guest_count,
          eventType: '',
          status: 'PLANNED'
        } : undefined,
        status: indent.status,
        totalItems: indent.total_items,
        createdBy: indent.created_by,
        createdAt: new Date(indent.created_at),
        items: indent.items?.map((item: any) => ({
          id: item.id,
          indentId: indent.id,
          itemName: item.item_name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          isInStock: item.is_in_stock,
          stockId: item.stock_id,
          stock: item.stock,
          isReceived: item.is_received,
          receivedAt: item.received_at ? new Date(item.received_at) : undefined,
          notes: item.notes
        })) || []
      }));

      return indents;
    });
  }

  /**
   * GET /api/kitchen/indents/:id
   * Get a specific indent by ID
   */
  static async getIndentById(request: ApiRequest): Promise<ApiResponse<Indent>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { id } = req.params || {};

      if (!id) {
        throw new Error('Indent ID is required');
      }

      let query = supabase
        .from('kitchen_indents')
        .select(`
          *,
          event:kitchen_events(id, name, date, guest_count, event_type, status),
          items:kitchen_indent_items(
            id, item_name, category, quantity, unit,
            is_in_stock, is_received, received_at, notes,
            stock:kitchen_stock(id, item_name, quantity, unit, expiry_date)
          )
        `)
        .eq('id', id)
        .single();

      const { data, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Indent not found');
        }
        throw new Error(`Failed to fetch indent: ${error.message}`);
      }

      const indent: Indent = {
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
        status: data.status,
        totalItems: data.total_items,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        items: data.items?.map((item: any) => ({
          id: item.id,
          indentId: data.id,
          itemName: item.item_name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          isInStock: item.is_in_stock,
          stockId: item.stock_id,
          stock: item.stock,
          isReceived: item.is_received,
          receivedAt: item.received_at ? new Date(item.received_at) : undefined,
          notes: item.notes
        })) || []
      };

      return indent;
    });
  }

  /**
   * POST /api/kitchen/indents
   * Create a new indent
   */
  static async createIndent(request: ApiRequest): Promise<ApiResponse<Indent>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can create indents
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to create indents');
      }

      const { eventId, items } = req.body || {};

      if (!eventId || !items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Event ID and items array are required');
      }

      // Validate items
      for (const item of items) {
        if (!item.itemName || !item.category || !item.quantity || !item.unit) {
          throw new Error('Each item must have itemName, category, quantity, and unit');
        }
        if (item.quantity <= 0) {
          throw new Error('Item quantity must be greater than 0');
        }
      }

      // Create indent
      const indentData = {
        event_id: eventId,
        status: 'DRAFT',
        total_items: items.length,
        created_by: user.id
      };

      const { data: indent, error: indentError } = await supabase
        .from('kitchen_indents')
        .insert([indentData])
        .select()
        .single();

      if (indentError) {
        throw new Error(`Failed to create indent: ${indentError.message}`);
      }

      // Create indent items
      const itemsData = items.map((item: any) => ({
        indent_id: indent.id,
        item_name: item.itemName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        is_in_stock: false,
        stock_id: item.stockId || null,
        is_received: false,
        notes: item.notes || null
      }));

      const { data: createdItems, error: itemsError } = await supabase
        .from('kitchen_indent_items')
        .insert(itemsData)
        .select();

      if (itemsError) {
        // Rollback indent creation
        await supabase.from('kitchen_indents').delete().eq('id', indent.id);
        throw new Error(`Failed to create indent items: ${itemsError.message}`);
      }

      // Return created indent with items
      return await this.getIndentById({ 
        ...request, 
        params: { id: indent.id } 
      }).then(response => response.data!);
    });
  }
}  /
**
   * PUT /api/kitchen/indents/:id
   * Update an existing indent
   */
  static async updateIndent(request: ApiRequest): Promise<ApiResponse<Indent>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can update indents
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to update indents');
      }

      const { id } = req.params || {};
      const { status, items } = req.body || {};

      if (!id) {
        throw new Error('Indent ID is required');
      }

      const updateData: any = {};
      if (status) {
        updateData.status = status;
      }

      // Update indent
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('kitchen_indents')
          .update(updateData)
          .eq('id', id);

        if (error) {
          throw new Error(`Failed to update indent: ${error.message}`);
        }
      }

      // Update items if provided
      if (items && Array.isArray(items)) {
        // Delete existing items
        await supabase
          .from('kitchen_indent_items')
          .delete()
          .eq('indent_id', id);

        // Create new items
        const itemsData = items.map((item: any) => ({
          indent_id: id,
          item_name: item.itemName,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          is_in_stock: item.isInStock || false,
          stock_id: item.stockId || null,
          is_received: item.isReceived || false,
          received_at: item.receivedAt ? new Date(item.receivedAt).toISOString() : null,
          notes: item.notes || null
        }));

        const { error: itemsError } = await supabase
          .from('kitchen_indent_items')
          .insert(itemsData);

        if (itemsError) {
          throw new Error(`Failed to update indent items: ${itemsError.message}`);
        }

        // Update total items count
        await supabase
          .from('kitchen_indents')
          .update({ total_items: items.length })
          .eq('id', id);
      }

      // Return updated indent
      return await this.getIndentById({ 
        ...request, 
        params: { id } 
      }).then(response => response.data!);
    });
  }

  /**
   * PATCH /api/kitchen/indents/:id/items/:itemId/receive
   * Mark an indent item as received
   */
  static async markItemReceived(request: ApiRequest): Promise<ApiResponse<{ message: string }>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { id, itemId } = req.params || {};
      const { quantity, notes } = req.body || {};

      if (!id || !itemId) {
        throw new Error('Indent ID and Item ID are required');
      }

      const updateData: any = {
        is_received: true,
        received_at: new Date().toISOString()
      };

      if (quantity !== undefined) {
        updateData.quantity = quantity;
      }

      if (notes) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('kitchen_indent_items')
        .update(updateData)
        .eq('id', itemId)
        .eq('indent_id', id);

      if (error) {
        throw new Error(`Failed to mark item as received: ${error.message}`);
      }

      return { message: 'Item marked as received successfully' };
    });
  }

  /**
   * POST /api/kitchen/indents/:id/submit
   * Submit an indent for approval
   */
  static async submitIndent(request: ApiRequest): Promise<ApiResponse<Indent>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can submit indents
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to submit indents');
      }

      const { id } = req.params || {};

      if (!id) {
        throw new Error('Indent ID is required');
      }

      // Check if indent exists and is in DRAFT status
      const { data: indent, error: checkError } = await supabase
        .from('kitchen_indents')
        .select('status')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new Error(`Indent not found: ${checkError.message}`);
      }

      if (indent.status !== 'DRAFT') {
        throw new Error('Only draft indents can be submitted');
      }

      // Update status to SUBMITTED
      const { error } = await supabase
        .from('kitchen_indents')
        .update({ status: 'SUBMITTED' })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to submit indent: ${error.message}`);
      }

      // Return updated indent
      return await this.getIndentById({ 
        ...request, 
        params: { id } 
      }).then(response => response.data!);
    });
  }

  /**
   * POST /api/kitchen/indents/:id/approve
   * Approve a submitted indent
   */
  static async approveIndent(request: ApiRequest): Promise<ApiResponse<Indent>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can approve indents
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to approve indents');
      }

      const { id } = req.params || {};

      if (!id) {
        throw new Error('Indent ID is required');
      }

      // Update status to APPROVED
      const { error } = await supabase
        .from('kitchen_indents')
        .update({ status: 'APPROVED' })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to approve indent: ${error.message}`);
      }

      // Return updated indent
      return await this.getIndentById({ 
        ...request, 
        params: { id } 
      }).then(response => response.data!);
    });
  }

  /**
   * DELETE /api/kitchen/indents/:id
   * Delete an indent (only if in DRAFT status)
   */
  static async deleteIndent(request: ApiRequest): Promise<ApiResponse<{ message: string }>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can delete indents
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to delete indents');
      }

      const { id } = req.params || {};

      if (!id) {
        throw new Error('Indent ID is required');
      }

      // Check if indent is in DRAFT status
      const { data: indent, error: checkError } = await supabase
        .from('kitchen_indents')
        .select('status')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new Error(`Indent not found: ${checkError.message}`);
      }

      if (indent.status !== 'DRAFT') {
        throw new Error('Only draft indents can be deleted');
      }

      // Delete indent items first (due to foreign key constraint)
      await supabase
        .from('kitchen_indent_items')
        .delete()
        .eq('indent_id', id);

      // Delete indent
      const { error } = await supabase
        .from('kitchen_indents')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete indent: ${error.message}`);
      }

      return { message: 'Indent deleted successfully' };
    });
  }
}