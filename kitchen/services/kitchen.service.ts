// Kitchen Service - Business logic and calculations

import { supabase, dbUtils } from '../lib/supabase';
import { 
  KitchenEvent, 
  Indent, 
  IndentItem, 
  CookingLog, 
  Stock, 
  Leftover,
  DashboardData,
  CreateIndentForm,
  UpdateCookingStatusForm,
  AddStockForm
} from '../types';

export class KitchenService {
  
  // Dashboard data aggregation
  static async getDashboardData(userId: string, userRole: string): Promise<DashboardData> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's events (filtered by role)
    let eventsQuery = supabase
      .from('kitchen_events')
      .select(`
        *,
        chef:kitchen_users(name, email),
        indents(id, status, totalItems),
        cookingLogs:kitchen_cooking_logs(id, status, dishName)
      `)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString());

    // Filter by assigned chef if user is a chef
    if (userRole === 'CHEF') {
      eventsQuery = eventsQuery.eq('assignedChef', userId);
    }

    const { data: todaysEvents } = await eventsQuery;

    // Get pending indents
    const { data: pendingIndents } = await supabase
      .from('kitchen_indents')
      .select(`
        *,
        event:kitchen_events(name, date, guestCount),
        items:kitchen_indent_items(id, itemName, isReceived)
      `)
      .in('status', ['SUBMITTED', 'APPROVED', 'IN_PROGRESS']);

    // Get active cooking tasks
    let cookingQuery = supabase
      .from('kitchen_cooking_logs')
      .select(`
        *,
        event:kitchen_events(name, date),
        chef:kitchen_users(name)
      `)
      .in('status', ['NOT_STARTED', 'IN_PROGRESS']);

    if (userRole === 'CHEF') {
      cookingQuery = cookingQuery.eq('assignedTo', userId);
    }

    const { data: activeCooking } = await cookingQuery;

    // Get low stock items
    const { data: lowStockItems } = await supabase
      .from('kitchen_stock')
      .select('*')
      .eq('isActive', true)
      .filter('quantity', 'lte', 'minStock');

    // Calculate stats
    const stats = {
      totalEvents: todaysEvents?.length || 0,
      completedDishes: activeCooking?.filter(log => log.status === 'COMPLETED').length || 0,
      pendingDishes: activeCooking?.filter(log => log.status !== 'COMPLETED').length || 0,
      stockItems: lowStockItems?.length || 0,
    };

    return {
      todaysEvents: todaysEvents || [],
      pendingIndents: pendingIndents || [],
      activeCooking: activeCooking || [],
      lowStockItems: lowStockItems || [],
      stats,
    };
  }

  // Auto-calculate quantities based on guest count and menu items
  static calculateQuantities(menuItems: any[], guestCount: number): IndentItem[] {
    const calculations: { [key: string]: IndentItem } = {};

    menuItems.forEach(item => {
      const baseQuantity = this.getBaseQuantityPerPerson(item.category, item.name);
      const totalQuantity = baseQuantity * guestCount;
      
      // Add buffer (10% extra)
      const finalQuantity = Math.ceil(totalQuantity * 1.1);

      const key = `${item.name}-${item.category}`;
      
      if (calculations[key]) {
        calculations[key].quantity += finalQuantity;
      } else {
        calculations[key] = {
          id: '', // Will be set when saved
          indentId: '',
          itemName: item.name,
          category: item.category,
          quantity: finalQuantity,
          unit: this.getUnitForItem(item.category, item.name),
          isInStock: false,
          isReceived: false,
        };
      }
    });

    return Object.values(calculations);
  }

  // Get base quantity per person for different items
  private static getBaseQuantityPerPerson(category: string, itemName: string): number {
    const quantities: { [key: string]: { [key: string]: number } } = {
      'Rice': { 'default': 0.15 }, // 150g per person
      'Dal': { 'default': 0.1 }, // 100g per person
      'Vegetables': { 'default': 0.12 }, // 120g per person
      'Meat': { 'default': 0.15 }, // 150g per person
      'Chicken': { 'default': 0.2 }, // 200g per person
      'Fish': { 'default': 0.18 }, // 180g per person
      'Beverages': { 'default': 0.25 }, // 250ml per person
      'Desserts': { 'default': 0.1 }, // 100g per person
    };

    return quantities[category]?.[itemName] || quantities[category]?.['default'] || 0.1;
  }

  // Get appropriate unit for items
  private static getUnitForItem(category: string, itemName: string): string {
    const units: { [key: string]: string } = {
      'Rice': 'kg',
      'Dal': 'kg',
      'Vegetables': 'kg',
      'Meat': 'kg',
      'Chicken': 'kg',
      'Fish': 'kg',
      'Beverages': 'liters',
      'Desserts': 'kg',
      'Spices': 'grams',
      'Oil': 'liters',
    };

    return units[category] || 'pieces';
  }

  // Create indent with auto-calculated quantities
  static async createIndent(form: CreateIndentForm, createdBy: string): Promise<Indent> {
    // Get event details
    const { data: event } = await supabase
      .from('kitchen_events')
      .select('*')
      .eq('id', form.eventId)
      .single();

    if (!event) {
      throw new Error('Event not found');
    }

    // Create indent
    const { data: indent, error: indentError } = await supabase
      .from('kitchen_indents')
      .insert({
        eventId: form.eventId,
        status: 'DRAFT',
        totalItems: form.items.length,
        createdBy,
      })
      .select()
      .single();

    if (indentError) throw indentError;

    // Create indent items with stock checking
    const itemsWithStock = await Promise.all(
      form.items.map(async (item) => {
        // Check if item exists in stock
        const { data: stockItem } = await supabase
          .from('kitchen_stock')
          .select('*')
          .eq('itemName', item.itemName)
          .eq('isActive', true)
          .gte('quantity', item.quantity)
          .single();

        return {
          indentId: indent.id,
          ...item,
          isInStock: !!stockItem,
          stockId: stockItem?.id,
        };
      })
    );

    const { data: indentItems, error: itemsError } = await supabase
      .from('kitchen_indent_items')
      .insert(itemsWithStock)
      .select();

    if (itemsError) throw itemsError;

    return {
      ...indent,
      items: indentItems,
    };
  }

  // Update cooking status with timing
  static async updateCookingStatus(form: UpdateCookingStatusForm, userId: string): Promise<CookingLog> {
    const updateData: any = {
      status: form.status,
      notes: form.notes,
      estimatedTime: form.estimatedTime,
    };

    // Set timestamps based on status
    if (form.status === 'IN_PROGRESS') {
      updateData.startedAt = new Date().toISOString();
    } else if (form.status === 'COMPLETED') {
      updateData.completedAt = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('kitchen_cooking_logs')
      .update(updateData)
      .eq('id', form.id)
      .eq('assignedTo', userId) // Ensure chef can only update their own tasks
      .select(`
        *,
        event:kitchen_events(name, date),
        chef:kitchen_users(name)
      `)
      .single();

    if (error) throw error;

    return data;
  }

  // Add stock with automatic categorization
  static async addStock(form: AddStockForm): Promise<Stock> {
    const { data, error } = await supabase
      .from('kitchen_stock')
      .insert({
        ...form,
        isActive: true,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // Process leftovers and return to stock
  static async processLeftovers(eventId: string, leftovers: Leftover[]): Promise<void> {
    // Create leftover records
    const { error: leftoverError } = await supabase
      .from('kitchen_leftovers')
      .insert(leftovers.map(leftover => ({
        eventId,
        itemName: leftover.itemName,
        quantity: leftover.quantity,
        unit: leftover.unit,
        estimatedCost: leftover.estimatedCost,
        notes: leftover.notes,
      })));

    if (leftoverError) throw leftoverError;

    // Return usable items to stock
    const stockUpdates = leftovers
      .filter(leftover => leftover.quantity > 0 && leftover.stockId)
      .map(leftover => ({
        stockId: leftover.stockId!,
        type: 'RETURNED',
        quantity: leftover.quantity,
        reason: `Leftover from event ${eventId}`,
      }));

    if (stockUpdates.length > 0) {
      await supabase
        .from('kitchen_stock_updates')
        .insert(stockUpdates);

      // Update stock quantities
      for (const update of stockUpdates) {
        await supabase.rpc('increment_stock', {
          stock_id: update.stockId,
          quantity_change: update.quantity,
        });
      }
    }
  }

  // Get cooking timeline for an event
  static async getCookingTimeline(eventId: string): Promise<CookingLog[]> {
    const { data, error } = await supabase
      .from('kitchen_cooking_logs')
      .select(`
        *,
        chef:kitchen_users(name, email)
      `)
      .eq('eventId', eventId)
      .order('priority', { ascending: false })
      .order('createdAt', { ascending: true });

    if (error) throw error;

    return data || [];
  }

  // Calculate event costing
  static async calculateEventCosting(eventId: string): Promise<{
    totalCost: number;
    itemCosts: { itemName: string; quantity: number; cost: number }[];
    leftoverValue: number;
  }> {
    // Get used items from indent
    const { data: indentItems } = await supabase
      .from('kitchen_indent_items')
      .select(`
        *,
        stock:kitchen_stock(costPerUnit)
      `)
      .eq('indent.eventId', eventId)
      .eq('isReceived', true);

    // Calculate item costs
    const itemCosts = (indentItems || []).map(item => ({
      itemName: item.itemName,
      quantity: item.quantity,
      cost: (item.stock?.costPerUnit || 0) * item.quantity,
    }));

    const totalCost = itemCosts.reduce((sum, item) => sum + item.cost, 0);

    // Get leftover value
    const { data: leftovers } = await supabase
      .from('kitchen_leftovers')
      .select('estimatedCost')
      .eq('eventId', eventId);

    const leftoverValue = (leftovers || []).reduce((sum, leftover) => sum + (leftover.estimatedCost || 0), 0);

    return {
      totalCost,
      itemCosts,
      leftoverValue,
    };
  }

  // Get stock alerts (low stock, expiring soon)
  static async getStockAlerts(): Promise<{
    lowStock: Stock[];
    expiringSoon: Stock[];
  }> {
    // Low stock items
    const { data: lowStock } = await supabase
      .from('kitchen_stock')
      .select('*')
      .eq('isActive', true)
      .filter('quantity', 'lte', 'minStock');

    // Items expiring in next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data: expiringSoon } = await supabase
      .from('kitchen_stock')
      .select('*')
      .eq('isActive', true)
      .not('expiryDate', 'is', null)
      .lte('expiryDate', nextWeek.toISOString());

    return {
      lowStock: lowStock || [],
      expiringSoon: expiringSoon || [],
    };
  }
}