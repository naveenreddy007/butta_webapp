/**
 * Kitchen Service using Prisma-Supabase Adapter
 * 
 * This service provides all kitchen operations using a Prisma-like interface
 * over Supabase until we get direct Prisma connection working.
 */

import { prismaSupabase, withTransaction } from '../lib/prisma-supabase';

/**
 * Events Service
 */
export class EventsService {
  /**
   * Get all events with optional filtering
   */
  static async getEvents(filters: {
    status?: string;
    date?: Date;
    assignedChef?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { status, date, assignedChef, limit = 50 } = filters;

    const where: any = {};
    if (status) where.status = status;
    if (date) where.date = { gte: date };
    if (assignedChef) where.assignedChefId = assignedChef;

    return await prismaSupabase.event.findMany({
      where,
      include: {
        assignedChef: true
      },
      orderBy: { date: 'asc' },
      take: limit
    });
  }

  /**
   * Get event by ID
   */
  static async getEventById(id: string) {
    return await prismaSupabase.event.findUnique({
      where: { id },
      include: {
        assignedChef: true
      }
    });
  }

  /**
   * Create new event
   */
  static async createEvent(data: {
    name: string;
    date: Date;
    guestCount: number;
    eventType: string;
    assignedChefId?: string;
    notes?: string;
  }) {
    return await prismaSupabase.event.create({
      data: {
        name: data.name,
        date: data.date,
        guest_count: data.guestCount,
        event_type: data.eventType,
        assigned_chef: data.assignedChefId,
        status: 'PLANNED'
      }
    });
  }

  /**
   * Update event
   */
  static async updateEvent(id: string, data: Partial<{
    name: string;
    date: Date;
    guestCount: number;
    eventType: string;
    status: string;
    assignedChefId: string;
    notes: string;
  }>) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.date) updateData.date = data.date;
    if (data.guestCount) updateData.guest_count = data.guestCount;
    if (data.eventType) updateData.event_type = data.eventType;
    if (data.status) updateData.status = data.status;
    if (data.assignedChefId) updateData.assigned_chef = data.assignedChefId;

    return await prismaSupabase.event.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Get event dashboard data
   */
  static async getEventDashboard(id: string) {
    const event = await this.getEventById(id);
    if (!event) throw new Error('Event not found');

    const cookingStats = await prismaSupabase.cookingLog.groupBy({
      by: ['status'],
      where: { eventId: id },
      _count: true
    });

    return {
      event,
      cookingStats: cookingStats.reduce((acc: any, stat: any) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {}),
      indentStats: {} // TODO: Implement when indent tables are ready
    };
  }
}

/**
 * Stock Service
 */
export class StockService {
  /**
   * Get all stock items
   */
  static async getStock(filters: {
    category?: string;
    isActive?: boolean;
    lowStock?: boolean;
    expiring?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { category, isActive, search, limit = 100 } = filters;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.is_active = isActive;
    if (search) where.item_name = { contains: search };

    let stockItems = await prismaSupabase.stock.findMany({
      where,
      orderBy: { item_name: 'asc' },
      take: limit
    });

    // Apply additional filters
    if (filters.lowStock) {
      stockItems = stockItems.filter((item: any) => 
        item.min_stock && item.quantity <= item.min_stock
      );
    }

    if (filters.expiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      stockItems = stockItems.filter((item: any) => 
        item.expiry_date && new Date(item.expiry_date) <= thirtyDaysFromNow
      );
    }

    return stockItems;
  }

  /**
   * Get stock item by ID
   */
  static async getStockById(id: string) {
    return await prismaSupabase.stock.findUnique({
      where: { id }
    });
  }

  /**
   * Create stock item
   */
  static async createStock(data: {
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate?: Date;
    batchNumber?: string;
    supplier?: string;
    costPerUnit?: number;
    minStock?: number;
  }, userId: string) {
    return await prismaSupabase.stock.create({
      data: {
        item_name: data.itemName,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        expiry_date: data.expiryDate,
        batch_number: data.batchNumber,
        supplier: data.supplier,
        cost_per_unit: data.costPerUnit,
        min_stock: data.minStock,
        is_active: true
      }
    });
  }

  /**
   * Update stock quantity
   */
  static async updateStockQuantity(
    id: string,
    type: 'ADDED' | 'REMOVED' | 'USED' | 'EXPIRED' | 'DAMAGED',
    quantity: number,
    reason: string,
    userId: string
  ) {
    return await withTransaction(async (tx) => {
      const currentStock = await tx.stock.findUnique({
        where: { id }
      });

      if (!currentStock) {
        throw new Error('Stock item not found');
      }

      let newQuantity = currentStock.quantity;
      if (type === 'ADDED') {
        newQuantity += quantity;
      } else {
        newQuantity -= quantity;
        if (newQuantity < 0) {
          throw new Error('Insufficient stock quantity');
        }
      }

      return await tx.stock.update({
        where: { id },
        data: { quantity: newQuantity }
      });
    });
  }

  /**
   * Get stock alerts
   */
  static async getStockAlerts() {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const [allStock] = await Promise.all([
      prismaSupabase.stock.findMany({
        where: { is_active: true }
      })
    ]);

    const lowStockItems = allStock.filter((item: any) => 
      item.min_stock && item.quantity <= item.min_stock
    );

    const expiringItems = allStock.filter((item: any) => 
      item.expiry_date && new Date(item.expiry_date) <= thirtyDaysFromNow && new Date(item.expiry_date) > now
    );

    const expiredItems = allStock.filter((item: any) => 
      item.expiry_date && new Date(item.expiry_date) < now
    );

    return {
      lowStock: lowStockItems.map((item: any) => ({
        id: item.id,
        itemName: item.item_name,
        category: item.category,
        currentQuantity: item.quantity,
        minStock: item.min_stock,
        unit: item.unit,
        severity: item.quantity === 0 ? 'critical' : 'warning'
      })),
      expiring: expiringItems.map((item: any) => {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: item.id,
          itemName: item.item_name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          expiryDate: item.expiry_date,
          daysUntilExpiry,
          severity: daysUntilExpiry <= 7 ? 'critical' : 
                   daysUntilExpiry <= 14 ? 'warning' : 'info'
        };
      }),
      expired: expiredItems.map((item: any) => ({
        id: item.id,
        itemName: item.item_name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiry_date,
        daysExpired: Math.ceil(
          (now.getTime() - new Date(item.expiry_date).getTime()) / (1000 * 60 * 60 * 24)
        )
      })),
      summary: {
        totalAlerts: lowStockItems.length + expiringItems.length + expiredItems.length,
        lowStockCount: lowStockItems.length,
        expiringCount: expiringItems.length,
        expiredCount: expiredItems.length,
        criticalCount: lowStockItems.filter((item: any) => item.quantity === 0).length +
                      expiringItems.filter((item: any) => {
                        const days = Math.ceil(
                          (new Date(item.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        return days <= 7;
                      }).length + expiredItems.length
      }
    };
  }
}

/**
 * Cooking Service
 */
export class CookingService {
  /**
   * Get cooking board for event
   */
  static async getCookingBoard(eventId: string) {
    const tasks = await prismaSupabase.cookingLog.findMany({
      where: { eventId },
      orderBy: [
        { priority: 'desc' },
        { created_at: 'asc' }
      ]
    });

    // Group tasks by status for Kanban board
    const board = {
      NOT_STARTED: tasks.filter((task: any) => task.status === 'NOT_STARTED'),
      IN_PROGRESS: tasks.filter((task: any) => task.status === 'IN_PROGRESS'),
      COMPLETED: tasks.filter((task: any) => task.status === 'COMPLETED'),
      ON_HOLD: tasks.filter((task: any) => task.status === 'ON_HOLD')
    };

    const stats = {
      total: tasks.length,
      completed: board.COMPLETED.length,
      inProgress: board.IN_PROGRESS.length,
      notStarted: board.NOT_STARTED.length,
      onHold: board.ON_HOLD.length,
      completionPercentage: tasks.length > 0 ? 
        Math.round((board.COMPLETED.length / tasks.length) * 100) : 0
    };

    return {
      eventId,
      board,
      stats
    };
  }

  /**
   * Create cooking task
   */
  static async createCookingTask(data: {
    eventId: string;
    dishName: string;
    category: string;
    servings: number;
    assignedToId: string;
    estimatedTime?: number;
    priority?: string;
    notes?: string;
  }) {
    return await prismaSupabase.cookingLog.create({
      data: {
        event_id: data.eventId,
        dish_name: data.dishName,
        category: data.category,
        servings: data.servings,
        assigned_to: data.assignedToId,
        estimated_time: data.estimatedTime,
        priority: data.priority || 'NORMAL',
        notes: data.notes,
        status: 'NOT_STARTED'
      }
    });
  }

  /**
   * Update cooking task status
   */
  static async updateCookingStatus(
    id: string,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD',
    notes?: string
  ) {
    const updateData: any = { status };

    // Set timestamps based on status
    if (status === 'IN_PROGRESS') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'COMPLETED') {
      updateData.completed_at = new Date().toISOString();
    }

    if (notes) {
      updateData.notes = notes;
    }

    return await prismaSupabase.cookingLog.update({
      where: { id },
      data: updateData
    });
  }
}

export { prismaSupabase };