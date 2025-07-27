// Kitchen Service - Business logic and calculations

import { prisma } from '../lib/prisma';
import type { 
  User,
  Event, 
  Indent, 
  IndentItem, 
  CookingLog, 
  Stock, 
  Leftover,
  UserRole,
  EventStatus,
  IndentStatus,
  CookingStatus,
  Priority
} from '../lib/prisma';

// Custom types for forms and dashboard
interface DashboardData {
  todaysEvents: (Event & { 
    chef: User | null;
    indents: Indent[];
    cookingLogs: CookingLog[];
  })[];
  pendingIndents: (Indent & { 
    event: Event;
    items: IndentItem[];
  })[];
  activeCooking: (CookingLog & { 
    event: Event;
    chef: User;
  })[];
  lowStockItems: Stock[];
  stats: {
    totalEvents: number;
    completedDishes: number;
    pendingDishes: number;
    stockItems: number;
  };
}

interface CreateIndentForm {
  eventId: string;
  items: Omit<IndentItem, 'id' | 'indentId' | 'createdAt' | 'updatedAt'>[];
}

interface UpdateCookingStatusForm {
  id: string;
  status: CookingStatus;
  notes?: string;
  estimatedTime?: number;
}

interface AddStockForm {
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate?: Date;
  batchNumber?: string;
  supplier?: string;
  costPerUnit?: number;
  minStock?: number;
}

export class KitchenService {
  
  // Dashboard data aggregation
  static async getDashboardData(userId: string, userRole: UserRole): Promise<DashboardData> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's events (filtered by role)
    const todaysEvents = await prisma.event.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        ...(userRole === 'CHEF' ? { assignedChef: userId } : {}),
      },
      include: {
        chef: true,
        indents: {
          select: {
            id: true,
            status: true,
            totalItems: true,
          },
        },
        cookingLogs: {
          select: {
            id: true,
            status: true,
            dishName: true,
          },
        },
      },
    });

    // Get pending indents
    const pendingIndents = await prisma.indent.findMany({
      where: {
        status: {
          in: ['SUBMITTED', 'APPROVED', 'IN_PROGRESS'],
        },
      },
      include: {
        event: {
          select: {
            name: true,
            date: true,
            guestCount: true,
          },
        },
        items: {
          select: {
            id: true,
            itemName: true,
            isReceived: true,
          },
        },
      },
    });

    // Get active cooking tasks
    const activeCooking = await prisma.cookingLog.findMany({
      where: {
        status: {
          in: ['NOT_STARTED', 'IN_PROGRESS'],
        },
        ...(userRole === 'CHEF' ? { assignedTo: userId } : {}),
      },
      include: {
        event: {
          select: {
            name: true,
            date: true,
          },
        },
        chef: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get low stock items
    const lowStockItems = await prisma.stock.findMany({
      where: {
        isActive: true,
        AND: {
          quantity: {
            lte: prisma.stock.fields.minStock,
          },
        },
      },
    });

    // Calculate stats
    const stats = {
      totalEvents: todaysEvents.length,
      completedDishes: activeCooking.filter(log => log.status === 'COMPLETED').length,
      pendingDishes: activeCooking.filter(log => log.status !== 'COMPLETED').length,
      stockItems: lowStockItems.length,
    };

    return {
      todaysEvents,
      pendingIndents,
      activeCooking,
      lowStockItems,
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
  static async createIndent(form: CreateIndentForm, createdBy: string): Promise<Indent & { items: IndentItem[] }> {
    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: form.eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Create indent with items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create indent
      const indent = await tx.indent.create({
        data: {
          eventId: form.eventId,
          status: 'DRAFT',
          totalItems: form.items.length,
          createdBy,
        },
      });

      // Create indent items with stock checking
      const itemsWithStock = await Promise.all(
        form.items.map(async (item) => {
          // Check if item exists in stock
          const stockItem = await tx.stock.findFirst({
            where: {
              itemName: item.itemName,
              isActive: true,
              quantity: {
                gte: item.quantity,
              },
            },
          });

          return {
            indentId: indent.id,
            itemName: item.itemName,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            isInStock: !!stockItem,
            stockId: stockItem?.id || null,
            isReceived: false,
            notes: item.notes || null,
          };
        })
      );

      const indentItems = await tx.indentItem.createMany({
        data: itemsWithStock,
      });

      // Get created items
      const createdItems = await tx.indentItem.findMany({
        where: { indentId: indent.id },
      });

      return {
        ...indent,
        items: createdItems,
      };
    });

    return result;
  }

  // Update cooking status with timing
  static async updateCookingStatus(form: UpdateCookingStatusForm, userId: string): Promise<CookingLog & { event: Event; chef: User }> {
    const updateData: any = {
      status: form.status,
      notes: form.notes || null,
      estimatedTime: form.estimatedTime || null,
    };

    // Set timestamps based on status
    if (form.status === 'IN_PROGRESS') {
      updateData.startedAt = new Date();
    } else if (form.status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const cookingLog = await prisma.cookingLog.update({
      where: {
        id: form.id,
        assignedTo: userId, // Ensure chef can only update their own tasks
      },
      data: updateData,
      include: {
        event: true,
        chef: true,
      },
    });

    return cookingLog;
  }

  // Add stock with automatic categorization
  static async addStock(form: AddStockForm): Promise<Stock> {
    const stock = await prisma.stock.create({
      data: {
        itemName: form.itemName,
        category: form.category,
        quantity: form.quantity,
        unit: form.unit,
        expiryDate: form.expiryDate || null,
        batchNumber: form.batchNumber || null,
        supplier: form.supplier || null,
        costPerUnit: form.costPerUnit || null,
        minStock: form.minStock || null,
        isActive: true,
      },
    });

    return stock;
  }

  // Process leftovers and return to stock
  static async processLeftovers(eventId: string, leftovers: Omit<Leftover, 'id' | 'createdAt' | 'updatedAt'>[], updatedBy: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Create leftover records
      await tx.leftover.createMany({
        data: leftovers.map(leftover => ({
          eventId,
          itemName: leftover.itemName,
          quantity: leftover.quantity,
          unit: leftover.unit,
          stockId: leftover.stockId || null,
          isReturned: leftover.isReturned || false,
          returnedAt: leftover.returnedAt || null,
          estimatedCost: leftover.estimatedCost || null,
          notes: leftover.notes || null,
        })),
      });

      // Return usable items to stock
      const stockUpdates = leftovers.filter(leftover => leftover.quantity > 0 && leftover.stockId);

      for (const leftover of stockUpdates) {
        // Create stock update record
        await tx.stockUpdate.create({
          data: {
            stockId: leftover.stockId!,
            type: 'RETURNED',
            quantity: leftover.quantity,
            reason: `Leftover from event ${eventId}`,
            updatedBy,
          },
        });

        // Update stock quantity
        await tx.stock.update({
          where: { id: leftover.stockId! },
          data: {
            quantity: {
              increment: leftover.quantity,
            },
          },
        });
      }
    });
  }

  // Get cooking timeline for an event
  static async getCookingTimeline(eventId: string): Promise<(CookingLog & { chef: User })[]> {
    const cookingLogs = await prisma.cookingLog.findMany({
      where: { eventId },
      include: {
        chef: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return cookingLogs;
  }

  // Calculate event costing
  static async calculateEventCosting(eventId: string): Promise<{
    totalCost: number;
    itemCosts: { itemName: string; quantity: number; cost: number }[];
    leftoverValue: number;
  }> {
    // Get used items from indent
    const indentItems = await prisma.indentItem.findMany({
      where: {
        indent: {
          eventId,
        },
        isReceived: true,
      },
      include: {
        stock: {
          select: {
            costPerUnit: true,
          },
        },
      },
    });

    // Calculate item costs
    const itemCosts = indentItems.map(item => ({
      itemName: item.itemName,
      quantity: item.quantity,
      cost: (item.stock?.costPerUnit || 0) * item.quantity,
    }));

    const totalCost = itemCosts.reduce((sum, item) => sum + item.cost, 0);

    // Get leftover value
    const leftovers = await prisma.leftover.findMany({
      where: { eventId },
      select: { estimatedCost: true },
    });

    const leftoverValue = leftovers.reduce((sum, leftover) => sum + (leftover.estimatedCost || 0), 0);

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
    // Low stock items - using raw query since Prisma doesn't support column references in where clauses
    const lowStock = await prisma.$queryRaw<Stock[]>`
      SELECT * FROM kitchen_stock 
      WHERE is_active = true 
      AND quantity <= COALESCE(min_stock, 0)
    `;

    // Items expiring in next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const expiringSoon = await prisma.stock.findMany({
      where: {
        isActive: true,
        expiryDate: {
          not: null,
          lte: nextWeek,
        },
      },
    });

    return {
      lowStock,
      expiringSoon,
    };
  }
}