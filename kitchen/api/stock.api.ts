/**
 * Stock API Endpoints
 * 
 * Handles all stock/inventory-related operations for the Kitchen Module
 */

import { supabase } from '../lib/supabase';
import { ApiHandler, ApiRequest, ApiResponse } from './routes';
import { Stock, UserRole } from '../types';

export class StockApi {
  /**
   * GET /api/kitchen/stock
   * Get all stock items with optional filtering
   */
  static async getStock(request: ApiRequest): Promise<ApiResponse<Stock[]>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { category, lowStock, expiringSoon, isActive = 'true', limit = 100, offset = 0 } = req.query || {};

      let query = supabase
        .from('kitchen_stock')
        .select(`
          *,
          updates:kitchen_stock_updates(
            id, type, quantity, reason, created_at,
            user:kitchen_users!updated_by(id, name)
          )
        `)
        .eq('is_active', isActive === 'true')
        .order('item_name', { ascending: true });

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }

      if (lowStock === 'true') {
        query = query.or('quantity.lt.min_stock,min_stock.is.null');
      }

      if (expiringSoon === 'true') {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        query = query.lte('expiry_date', nextWeek.toISOString());
      }

      // Apply pagination
      query = query.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch stock: ${error.message}`);
      }

      // Transform data to match Stock interface
      const stock: Stock[] = data.map(item => ({
        id: item.id,
        itemName: item.item_name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiry_date ? new Date(item.expiry_date) : undefined,
        batchNumber: item.batch_number,
        supplier: item.supplier,
        costPerUnit: item.cost_per_unit,
        isActive: item.is_active,
        minStock: item.min_stock
      }));

      return stock;
    });
  }

  /**
   * GET /api/kitchen/stock/:id
   * Get a specific stock item by ID
   */
  static async getStockById(request: ApiRequest): Promise<ApiResponse<Stock>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { id } = req.params || {};

      if (!id) {
        throw new Error('Stock ID is required');
      }

      const { data, error } = await supabase
        .from('kitchen_stock')
        .select(`
          *,
          updates:kitchen_stock_updates(
            id, type, quantity, reason, created_at,
            user:kitchen_users!updated_by(id, name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Stock item not found');
        }
        throw new Error(`Failed to fetch stock item: ${error.message}`);
      }

      const stock: Stock = {
        id: data.id,
        itemName: data.item_name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
        batchNumber: data.batch_number,
        supplier: data.supplier,
        costPerUnit: data.cost_per_unit,
        isActive: data.is_active,
        minStock: data.min_stock
      };

      return stock;
    });
  }

  /**
   * POST /api/kitchen/stock
   * Create a new stock item
   */
  static async createStock(request: ApiRequest): Promise<ApiResponse<Stock>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can create stock items
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to create stock items');
      }

      const { 
        itemName, category, quantity, unit, expiryDate, 
        batchNumber, supplier, costPerUnit, minStock 
      } = req.body || {};

      // Validate required fields
      if (!itemName || !category || quantity === undefined || !unit) {
        throw new Error('Missing required fields: itemName, category, quantity, unit');
      }

      if (quantity < 0) {
        throw new Error('Quantity cannot be negative');
      }

      const stockData = {
        item_name: itemName,
        category,
        quantity,
        unit,
        expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
        batch_number: batchNumber || null,
        supplier: supplier || null,
        cost_per_unit: costPerUnit || null,
        min_stock: minStock || null,
        is_active: true
      };

      const { data, error } = await supabase
        .from('kitchen_stock')
        .insert([stockData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create stock item: ${error.message}`);
      }

      // Create initial stock update record
      await supabase
        .from('kitchen_stock_updates')
        .insert([{
          stock_id: data.id,
          type: 'ADDED',
          quantity: quantity,
          reason: 'Initial stock creation',
          updated_by: user.id
        }]);

      const stock: Stock = {
        id: data.id,
        itemName: data.item_name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
        batchNumber: data.batch_number,
        supplier: data.supplier,
        costPerUnit: data.cost_per_unit,
        isActive: data.is_active,
        minStock: data.min_stock
      };

      return stock;
    });
  }
}  /*
*
   * PUT /api/kitchen/stock/:id
   * Update a stock item
   */
  static async updateStock(request: ApiRequest): Promise<ApiResponse<Stock>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can update stock items
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to update stock items');
      }

      const { id } = req.params || {};
      const updates = req.body || {};

      if (!id) {
        throw new Error('Stock ID is required');
      }

      // Validate updates
      const allowedFields = ['itemName', 'category', 'unit', 'expiryDate', 'batchNumber', 'supplier', 'costPerUnit', 'minStock'];
      const updateData: any = {};

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          if (key === 'itemName') {
            updateData.item_name = updates[key];
          } else if (key === 'expiryDate') {
            updateData.expiry_date = updates[key] ? new Date(updates[key]).toISOString() : null;
          } else if (key === 'batchNumber') {
            updateData.batch_number = updates[key];
          } else if (key === 'costPerUnit') {
            updateData.cost_per_unit = updates[key];
          } else if (key === 'minStock') {
            updateData.min_stock = updates[key];
          } else {
            updateData[key] = updates[key];
          }
        }
      });

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      const { data, error } = await supabase
        .from('kitchen_stock')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update stock item: ${error.message}`);
      }

      const stock: Stock = {
        id: data.id,
        itemName: data.item_name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
        batchNumber: data.batch_number,
        supplier: data.supplier,
        costPerUnit: data.cost_per_unit,
        isActive: data.is_active,
        minStock: data.min_stock
      };

      return stock;
    });
  }

  /**
   * PATCH /api/kitchen/stock/:id/quantity
   * Adjust stock quantity
   */
  static async adjustStockQuantity(request: ApiRequest): Promise<ApiResponse<Stock>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can adjust stock quantities
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to adjust stock quantities');
      }

      const { id } = req.params || {};
      const { adjustment, type, reason } = req.body || {};

      if (!id) {
        throw new Error('Stock ID is required');
      }

      if (adjustment === undefined || !type) {
        throw new Error('Adjustment amount and type are required');
      }

      const validTypes = ['ADDED', 'USED', 'EXPIRED', 'RETURNED', 'ADJUSTED'];
      if (!validTypes.includes(type)) {
        throw new Error('Invalid adjustment type');
      }

      // Get current stock
      const { data: currentStock, error: fetchError } = await supabase
        .from('kitchen_stock')
        .select('quantity')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`Stock item not found: ${fetchError.message}`);
      }

      // Calculate new quantity
      let newQuantity = currentStock.quantity;
      if (type === 'ADDED' || type === 'RETURNED') {
        newQuantity += Math.abs(adjustment);
      } else {
        newQuantity -= Math.abs(adjustment);
      }

      if (newQuantity < 0) {
        throw new Error('Stock quantity cannot be negative');
      }

      // Update stock quantity
      const { data, error } = await supabase
        .from('kitchen_stock')
        .update({ quantity: newQuantity })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to adjust stock quantity: ${error.message}`);
      }

      // Create stock update record
      await supabase
        .from('kitchen_stock_updates')
        .insert([{
          stock_id: id,
          type,
          quantity: Math.abs(adjustment),
          reason: reason || `Stock ${type.toLowerCase()}`,
          updated_by: user.id
        }]);

      const stock: Stock = {
        id: data.id,
        itemName: data.item_name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
        batchNumber: data.batch_number,
        supplier: data.supplier,
        costPerUnit: data.cost_per_unit,
        isActive: data.is_active,
        minStock: data.min_stock
      };

      return stock;
    });
  }

  /**
   * DELETE /api/kitchen/stock/:id
   * Delete a stock item (soft delete)
   */
  static async deleteStock(request: ApiRequest): Promise<ApiResponse<{ message: string }>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Admins can delete stock items
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.ADMIN)) {
        throw new Error('Insufficient permissions to delete stock items');
      }

      const { id } = req.params || {};

      if (!id) {
        throw new Error('Stock ID is required');
      }

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('kitchen_stock')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete stock item: ${error.message}`);
      }

      return { message: 'Stock item deleted successfully' };
    });
  }

  /**
   * GET /api/kitchen/stock/alerts
   * Get stock alerts (low stock and expiring items)
   */
  static async getStockAlerts(request: ApiRequest): Promise<ApiResponse<any>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Get low stock items
      const { data: lowStockItems, error: lowStockError } = await supabase
        .from('kitchen_stock')
        .select('*')
        .eq('is_active', true)
        .or('quantity.lt.min_stock,min_stock.is.null')
        .order('item_name');

      if (lowStockError) {
        throw new Error(`Failed to fetch low stock items: ${lowStockError.message}`);
      }

      // Get expiring items (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { data: expiringItems, error: expiringError } = await supabase
        .from('kitchen_stock')
        .select('*')
        .eq('is_active', true)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', nextWeek.toISOString())
        .order('expiry_date');

      if (expiringError) {
        throw new Error(`Failed to fetch expiring items: ${expiringError.message}`);
      }

      // Get expired items
      const now = new Date();
      const { data: expiredItems, error: expiredError } = await supabase
        .from('kitchen_stock')
        .select('*')
        .eq('is_active', true)
        .not('expiry_date', 'is', null)
        .lt('expiry_date', now.toISOString())
        .order('expiry_date');

      if (expiredError) {
        throw new Error(`Failed to fetch expired items: ${expiredError.message}`);
      }

      const alerts = {
        lowStock: lowStockItems.map(item => ({
          id: item.id,
          itemName: item.item_name,
          category: item.category,
          currentQuantity: item.quantity,
          minStock: item.min_stock,
          unit: item.unit,
          alertType: 'LOW_STOCK'
        })),
        expiring: expiringItems.map(item => ({
          id: item.id,
          itemName: item.item_name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          expiryDate: item.expiry_date,
          daysUntilExpiry: Math.ceil((new Date(item.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
          alertType: 'EXPIRING_SOON'
        })),
        expired: expiredItems.map(item => ({
          id: item.id,
          itemName: item.item_name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          expiryDate: item.expiry_date,
          daysExpired: Math.ceil((now.getTime() - new Date(item.expiry_date).getTime()) / (1000 * 60 * 60 * 24)),
          alertType: 'EXPIRED'
        })),
        summary: {
          totalAlerts: lowStockItems.length + expiringItems.length + expiredItems.length,
          lowStockCount: lowStockItems.length,
          expiringCount: expiringItems.length,
          expiredCount: expiredItems.length
        }
      };

      return alerts;
    });
  }

  /**
   * GET /api/kitchen/stock/categories
   * Get all stock categories
   */
  static async getStockCategories(request: ApiRequest): Promise<ApiResponse<string[]>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      const { data, error } = await supabase
        .from('kitchen_stock')
        .select('category')
        .eq('is_active', true)
        .order('category');

      if (error) {
        throw new Error(`Failed to fetch stock categories: ${error.message}`);
      }

      // Get unique categories
      const categories = [...new Set(data.map(item => item.category))];

      return categories;
    });
  }

  /**
   * POST /api/kitchen/stock/batch-adjust
   * Batch adjust multiple stock items
   */
  static async batchAdjustStock(request: ApiRequest): Promise<ApiResponse<{ message: string; updated: number }>> {
    return ApiHandler.handleRequest(request, async (req, user) => {
      // Only Kitchen Managers and Admins can batch adjust stock
      if (!ApiHandler.hasPermission(user.kitchenUser.role, UserRole.KITCHEN_MANAGER)) {
        throw new Error('Insufficient permissions to batch adjust stock');
      }

      const { adjustments } = req.body || {};

      if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
        throw new Error('Adjustments array is required');
      }

      let updatedCount = 0;

      // Process each adjustment
      for (const adj of adjustments) {
        const { stockId, adjustment, type, reason } = adj;

        if (!stockId || adjustment === undefined || !type) {
          continue; // Skip invalid adjustments
        }

        try {
          // Get current stock
          const { data: currentStock, error: fetchError } = await supabase
            .from('kitchen_stock')
            .select('quantity')
            .eq('id', stockId)
            .single();

          if (fetchError) continue;

          // Calculate new quantity
          let newQuantity = currentStock.quantity;
          if (type === 'ADDED' || type === 'RETURNED') {
            newQuantity += Math.abs(adjustment);
          } else {
            newQuantity -= Math.abs(adjustment);
          }

          if (newQuantity < 0) continue; // Skip if would result in negative

          // Update stock quantity
          const { error: updateError } = await supabase
            .from('kitchen_stock')
            .update({ quantity: newQuantity })
            .eq('id', stockId);

          if (updateError) continue;

          // Create stock update record
          await supabase
            .from('kitchen_stock_updates')
            .insert([{
              stock_id: stockId,
              type,
              quantity: Math.abs(adjustment),
              reason: reason || `Batch ${type.toLowerCase()}`,
              updated_by: user.id
            }]);

          updatedCount++;
        } catch (error) {
          // Continue with next adjustment if one fails
          continue;
        }
      }

      return { 
        message: `Successfully updated ${updatedCount} stock items`,
        updated: updatedCount
      };
    });
  }
}