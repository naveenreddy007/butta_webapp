/**
 * Integration Service for Kitchen Module
 * 
 * This service handles the integration between the Kitchen Module and the existing
 * event-menu-planner system, ensuring seamless data flow and consistency.
 */

import { MenuItem as ExistingMenuItem, MenuSelection, MenuCategory } from '../../src/types';
import { buttaBusinessInfo } from '../../src/data/businessInfo';
import { KitchenEvent, IndentItem, UserRole } from '../types';
import { supabase } from '../lib/supabase';

export interface EventData {
  id: string;
  name: string;
  date: Date;
  guestCount: number;
  eventType: string;
  menuSelections: MenuSelection[];
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  totalAmount: number;
  status: 'planned' | 'confirmed' | 'in_progress' | 'completed';
}

export interface KitchenIntegrationConfig {
  businessInfo: typeof buttaBusinessInfo;
  autoCreateIndents: boolean;
  autoAssignChefs: boolean;
  defaultBufferPercentage: number;
}

export class IntegrationService {
  private static config: KitchenIntegrationConfig = {
    businessInfo: buttaBusinessInfo,
    autoCreateIndents: true,
    autoAssignChefs: false,
    defaultBufferPercentage: 10
  };

  /**
   * Convert existing menu item to kitchen-compatible format
   */
  static convertMenuItemToKitchen(menuItem: ExistingMenuItem): {
    itemName: string;
    category: string;
    baseQuantityPerPerson: number;
    unit: string;
    estimatedCost: number;
  } {
    // Map existing categories to kitchen categories
    const categoryMapping: Record<string, string> = {
      'starters': 'Appetizers',
      'biryanis': 'Main Course',
      'curries': 'Main Course',
      'breads': 'Breads',
      'desserts': 'Desserts',
      'beverages': 'Beverages'
    };

    // Estimate base quantity per person based on item type
    const getBaseQuantity = (category: string, itemName: string): { quantity: number; unit: string } => {
      const lowerName = itemName.toLowerCase();
      
      if (category === 'starters') {
        if (lowerName.includes('chicken') || lowerName.includes('mutton') || lowerName.includes('prawn')) {
          return { quantity: 0.15, unit: 'kg' }; // 150g per person for non-veg starters
        }
        return { quantity: 0.1, unit: 'kg' }; // 100g per person for veg starters
      }
      
      if (category === 'biryanis') {
        return { quantity: 0.25, unit: 'kg' }; // 250g per person for biryani
      }
      
      if (category === 'curries') {
        return { quantity: 0.2, unit: 'kg' }; // 200g per person for curries
      }
      
      if (category === 'breads') {
        return { quantity: 2, unit: 'pieces' }; // 2 pieces per person
      }
      
      if (category === 'desserts') {
        return { quantity: 0.1, unit: 'kg' }; // 100g per person for desserts
      }
      
      if (category === 'beverages') {
        return { quantity: 0.2, unit: 'liters' }; // 200ml per person
      }
      
      return { quantity: 0.1, unit: 'kg' }; // Default
    };

    const { quantity, unit } = getBaseQuantity(menuItem.category, menuItem.name);

    return {
      itemName: menuItem.name,
      category: categoryMapping[menuItem.category] || 'Other',
      baseQuantityPerPerson: quantity,
      unit: unit,
      estimatedCost: menuItem.price || 0
    };
  }

  /**
   * Create a kitchen event from event-menu-planner data
   */
  static async createKitchenEvent(eventData: EventData): Promise<{ data: KitchenEvent | null; error: any }> {
    try {
      // Convert menu selections to kitchen format
      const menuItems = eventData.menuSelections.map(selection => ({
        ...this.convertMenuItemToKitchen(selection.item),
        quantity: selection.quantity,
        notes: selection.notes
      }));

      const kitchenEventData = {
        name: eventData.name,
        date: eventData.date.toISOString(),
        guest_count: eventData.guestCount,
        event_type: eventData.eventType,
        status: 'PLANNED',
        menu_items: menuItems,
        assigned_chef: null // Will be assigned later
      };

      const { data, error } = await supabase
        .from('kitchen_events')
        .insert([kitchenEventData])
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      const kitchenEvent: KitchenEvent = {
        id: data.id,
        name: data.name,
        date: new Date(data.date),
        guestCount: data.guest_count,
        eventType: data.event_type,
        status: data.status,
        menuItems: data.menu_items,
        assignedChef: data.assigned_chef
      };

      // Auto-create indent if configured
      if (this.config.autoCreateIndents) {
        await this.createAutoIndent(kitchenEvent);
      }

      return { data: kitchenEvent, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Automatically create indent from kitchen event
   */
  static async createAutoIndent(event: KitchenEvent): Promise<{ data: any; error: any }> {
    try {
      if (!event.menuItems) {
        return { data: null, error: new Error('No menu items found') };
      }

      // Calculate quantities with buffer
      const indentItems: Omit<IndentItem, 'id' | 'indentId'>[] = [];
      const itemMap = new Map<string, any>();

      event.menuItems.forEach((menuItem: any) => {
        const key = `${menuItem.itemName}-${menuItem.category}`;
        const totalQuantity = menuItem.baseQuantityPerPerson * event.guestCount;
        const bufferedQuantity = totalQuantity * (1 + this.config.defaultBufferPercentage / 100);

        if (itemMap.has(key)) {
          itemMap.get(key).quantity += bufferedQuantity;
        } else {
          itemMap.set(key, {
            itemName: menuItem.itemName,
            category: menuItem.category,
            quantity: Math.ceil(bufferedQuantity),
            unit: menuItem.unit,
            isInStock: false,
            stockId: null,
            isReceived: false,
            notes: menuItem.notes || null
          });
        }
      });

      const items = Array.from(itemMap.values());

      // Create indent
      const { data: indentData, error: indentError } = await supabase
        .from('kitchen_indents')
        .insert([{
          event_id: event.id,
          status: 'DRAFT',
          total_items: items.length,
          created_by: 'system' // Will be updated when a user creates it manually
        }])
        .select()
        .single();

      if (indentError) {
        return { data: null, error: indentError };
      }

      // Create indent items
      const indentItemsData = items.map(item => ({
        indent_id: indentData.id,
        item_name: item.itemName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        is_in_stock: item.isInStock,
        stock_id: item.stockId,
        is_received: item.isReceived,
        notes: item.notes
      }));

      const { data: itemsData, error: itemsError } = await supabase
        .from('kitchen_indent_items')
        .insert(indentItemsData)
        .select();

      if (itemsError) {
        return { data: null, error: itemsError };
      }

      return { data: { indent: indentData, items: itemsData }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Sync event updates from menu planner to kitchen
   */
  static async syncEventUpdate(eventId: string, updates: Partial<EventData>): Promise<{ error: any }> {
    try {
      const updateData: any = {};

      if (updates.name) updateData.name = updates.name;
      if (updates.date) updateData.date = updates.date.toISOString();
      if (updates.guestCount) updateData.guest_count = updates.guestCount;
      if (updates.eventType) updateData.event_type = updates.eventType;
      if (updates.menuSelections) {
        const menuItems = updates.menuSelections.map(selection => ({
          ...this.convertMenuItemToKitchen(selection.item),
          quantity: selection.quantity,
          notes: selection.notes
        }));
        updateData.menu_items = menuItems;
      }

      const { error } = await supabase
        .from('kitchen_events')
        .update(updateData)
        .eq('id', eventId);

      // If guest count or menu changed, recalculate indent
      if ((updates.guestCount || updates.menuSelections) && !error) {
        await this.recalculateIndent(eventId);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Recalculate indent when event details change
   */
  static async recalculateIndent(eventId: string): Promise<{ error: any }> {
    try {
      // Get the event
      const { data: event, error: eventError } = await supabase
        .from('kitchen_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return { error: eventError || new Error('Event not found') };
      }

      // Get existing indent
      const { data: indent, error: indentError } = await supabase
        .from('kitchen_indents')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'DRAFT')
        .single();

      if (indentError || !indent) {
        // Create new indent if none exists
        const kitchenEvent: KitchenEvent = {
          id: event.id,
          name: event.name,
          date: new Date(event.date),
          guestCount: event.guest_count,
          eventType: event.event_type,
          status: event.status,
          menuItems: event.menu_items,
          assignedChef: event.assigned_chef
        };
        return await this.createAutoIndent(kitchenEvent);
      }

      // Delete existing indent items
      await supabase
        .from('kitchen_indent_items')
        .delete()
        .eq('indent_id', indent.id);

      // Recalculate and create new items
      const kitchenEvent: KitchenEvent = {
        id: event.id,
        name: event.name,
        date: new Date(event.date),
        guestCount: event.guest_count,
        eventType: event.event_type,
        status: event.status,
        menuItems: event.menu_items,
        assignedChef: event.assigned_chef
      };

      // Calculate new quantities
      const indentItems: any[] = [];
      const itemMap = new Map<string, any>();

      if (event.menu_items) {
        event.menu_items.forEach((menuItem: any) => {
          const key = `${menuItem.itemName}-${menuItem.category}`;
          const totalQuantity = menuItem.baseQuantityPerPerson * event.guest_count;
          const bufferedQuantity = totalQuantity * (1 + this.config.defaultBufferPercentage / 100);

          if (itemMap.has(key)) {
            itemMap.get(key).quantity += bufferedQuantity;
          } else {
            itemMap.set(key, {
              itemName: menuItem.itemName,
              category: menuItem.category,
              quantity: Math.ceil(bufferedQuantity),
              unit: menuItem.unit,
              isInStock: false,
              stockId: null,
              isReceived: false,
              notes: menuItem.notes || null
            });
          }
        });
      }

      const items = Array.from(itemMap.values());

      // Create new indent items
      const indentItemsData = items.map(item => ({
        indent_id: indent.id,
        item_name: item.itemName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        is_in_stock: item.isInStock,
        stock_id: item.stockId,
        is_received: item.isReceived,
        notes: item.notes
      }));

      const { error: itemsError } = await supabase
        .from('kitchen_indent_items')
        .insert(indentItemsData);

      // Update indent total items
      await supabase
        .from('kitchen_indents')
        .update({ total_items: items.length })
        .eq('id', indent.id);

      return { error: itemsError };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get business information for kitchen module
   */
  static getBusinessInfo() {
    return {
      name: this.config.businessInfo.name,
      logo: this.config.businessInfo.logo,
      contact: this.config.businessInfo.contact,
      branding: this.config.businessInfo.branding
    };
  }

  /**
   * Check if user has access to both systems
   */
  static async validateCrossSystemAccess(userId: string): Promise<{ hasAccess: boolean; role?: UserRole }> {
    try {
      const { data: user, error } = await supabase
        .from('kitchen_users')
        .select('role, is_active')
        .eq('id', userId)
        .single();

      if (error || !user || !user.is_active) {
        return { hasAccess: false };
      }

      return { hasAccess: true, role: user.role as UserRole };
    } catch (error) {
      return { hasAccess: false };
    }
  }

  /**
   * Create cooking tasks from menu items
   */
  static async createCookingTasks(eventId: string, assignedChefId?: string): Promise<{ error: any }> {
    try {
      const { data: event, error: eventError } = await supabase
        .from('kitchen_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return { error: eventError || new Error('Event not found') };
      }

      if (!event.menu_items) {
        return { error: new Error('No menu items found') };
      }

      // Get a default chef if none assigned
      let chefId = assignedChefId || event.assigned_chef;
      if (!chefId) {
        const { data: chefs } = await supabase
          .from('kitchen_users')
          .select('id')
          .eq('role', 'CHEF')
          .eq('is_active', true)
          .limit(1);

        if (chefs && chefs.length > 0) {
          chefId = chefs[0].id;
        }
      }

      if (!chefId) {
        return { error: new Error('No chef available for assignment') };
      }

      // Create cooking tasks for each menu item
      const cookingTasks = event.menu_items.map((menuItem: any, index: number) => ({
        event_id: eventId,
        dish_name: menuItem.itemName,
        category: menuItem.category,
        servings: event.guest_count,
        status: 'NOT_STARTED',
        assigned_to: chefId,
        estimated_time: this.estimateCookingTime(menuItem.category, menuItem.itemName),
        priority: this.determinePriority(menuItem.category, index),
        notes: menuItem.notes || null
      }));

      const { error: tasksError } = await supabase
        .from('kitchen_cooking_logs')
        .insert(cookingTasks);

      return { error: tasksError };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Estimate cooking time based on dish type
   */
  private static estimateCookingTime(category: string, dishName: string): number {
    const lowerName = dishName.toLowerCase();
    
    if (category === 'Appetizers') {
      return 30; // 30 minutes for starters
    }
    
    if (category === 'Main Course') {
      if (lowerName.includes('biryani')) {
        return 90; // 1.5 hours for biryani
      }
      return 60; // 1 hour for other main courses
    }
    
    if (category === 'Breads') {
      return 20; // 20 minutes for breads
    }
    
    if (category === 'Desserts') {
      return 45; // 45 minutes for desserts
    }
    
    if (category === 'Beverages') {
      return 15; // 15 minutes for beverages
    }
    
    return 45; // Default 45 minutes
  }

  /**
   * Determine cooking priority based on category and order
   */
  private static determinePriority(category: string, index: number): 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' {
    // Beverages and desserts can be prepared later
    if (category === 'Beverages' || category === 'Desserts') {
      return 'LOW';
    }
    
    // Main courses need higher priority
    if (category === 'Main Course') {
      return 'HIGH';
    }
    
    // First few items get higher priority
    if (index < 2) {
      return 'HIGH';
    }
    
    return 'NORMAL';
  }

  /**
   * Update configuration
   */
  static updateConfig(newConfig: Partial<KitchenIntegrationConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  static getConfig(): KitchenIntegrationConfig {
    return { ...this.config };
  }
}