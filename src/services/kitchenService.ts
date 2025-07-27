// Kitchen Service for Browser Environment
// This service handles kitchen data operations with proper error handling

interface DashboardStats {
  totalEvents: number;
  completedDishes: number;
  pendingDishes: number;
  stockItems: number;
}

interface KitchenEvent {
  id: string;
  name: string;
  date: Date;
  guestCount: number;
  eventType: string;
  status: string;
  chef?: { name: string };
}

interface CookingTask {
  id: string;
  dishName: string;
  category: string;
  servings: number;
  status: string;
  priority: string;
  chef?: { name: string };
  estimatedTime?: number;
  notes?: string;
}

interface StockItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  minStock?: number;
}

interface DashboardData {
  todaysEvents: KitchenEvent[];
  activeCooking: CookingTask[];
  lowStockItems: StockItem[];
  stats: DashboardStats;
}

class KitchenService {
  private static async simulateApiCall<T>(data: T, delay: number = 1000): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  }

  static async getDashboardData(userId: string, userRole: string): Promise<DashboardData> {
    try {
      // Simulate API call with mock data
      const mockData: DashboardData = {
        todaysEvents: [
          {
            id: '1',
            name: 'Wedding Reception - Sharma Family',
            date: new Date(),
            guestCount: 250,
            eventType: 'Wedding',
            status: 'PLANNED',
            chef: { name: 'Chef Ravi Kumar' }
          },
          {
            id: '2',
            name: 'Corporate Annual Meet - TechCorp',
            date: new Date(),
            guestCount: 150,
            eventType: 'Corporate',
            status: 'INDENT_CREATED',
            chef: { name: 'Chef Ravi Kumar' }
          },
          {
            id: '3',
            name: 'Birthday Party - Kids Special',
            date: new Date(),
            guestCount: 50,
            eventType: 'Birthday',
            status: 'COOKING_STARTED',
            chef: { name: 'Chef Ravi Kumar' }
          }
        ],
        activeCooking: [
          {
            id: '1',
            dishName: 'Butter Chicken',
            category: 'Main Course',
            servings: 250,
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            chef: { name: 'Chef Ravi Kumar' },
            estimatedTime: 120,
            notes: 'Using fresh chicken, extra creamy'
          },
          {
            id: '2',
            dishName: 'Dal Makhani',
            category: 'Main Course',
            servings: 250,
            status: 'NOT_STARTED',
            priority: 'NORMAL',
            chef: { name: 'Chef Ravi Kumar' },
            estimatedTime: 180,
            notes: 'Slow cook for 3 hours'
          },
          {
            id: '3',
            dishName: 'Paneer Tikka',
            category: 'Starter',
            servings: 250,
            status: 'COMPLETED',
            priority: 'NORMAL',
            chef: { name: 'Chef Ravi Kumar' },
            estimatedTime: 90,
            notes: 'Marinated overnight, perfectly grilled'
          }
        ],
        lowStockItems: [
          {
            id: '1',
            itemName: 'Basmati Rice',
            category: 'Grains',
            quantity: 5,
            unit: 'kg',
            minStock: 10
          },
          {
            id: '2',
            itemName: 'Chicken (Fresh)',
            category: 'Meat',
            quantity: 3,
            unit: 'kg',
            minStock: 5
          },
          {
            id: '3',
            itemName: 'Paneer',
            category: 'Dairy',
            quantity: 2,
            unit: 'kg',
            minStock: 3
          }
        ],
        stats: {
          totalEvents: 3,
          completedDishes: 1,
          pendingDishes: 2,
          stockItems: 3
        }
      };

      // Simulate network delay
      return await this.simulateApiCall(mockData, 800);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to load kitchen dashboard data');
    }
  }

  static async getStockAlerts(): Promise<{ lowStock: StockItem[]; expiringSoon: StockItem[] }> {
    try {
      const mockData = {
        lowStock: [
          {
            id: '1',
            itemName: 'Basmati Rice',
            category: 'Grains',
            quantity: 5,
            unit: 'kg',
            minStock: 10
          },
          {
            id: '2',
            itemName: 'Chicken (Fresh)',
            category: 'Meat',
            quantity: 3,
            unit: 'kg',
            minStock: 5
          }
        ],
        expiringSoon: [
          {
            id: '3',
            itemName: 'Milk',
            category: 'Dairy',
            quantity: 10,
            unit: 'liters',
            minStock: 5
          }
        ]
      };

      return await this.simulateApiCall(mockData, 500);
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      throw new Error('Failed to load stock alerts');
    }
  }

  static async getCookingTimeline(eventId: string): Promise<CookingTask[]> {
    try {
      const mockData: CookingTask[] = [
        {
          id: '1',
          dishName: 'Butter Chicken',
          category: 'Main Course',
          servings: 250,
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          chef: { name: 'Chef Ravi Kumar' },
          estimatedTime: 120,
          notes: 'Using fresh chicken, extra creamy'
        },
        {
          id: '2',
          dishName: 'Dal Makhani',
          category: 'Main Course',
          servings: 250,
          status: 'NOT_STARTED',
          priority: 'NORMAL',
          chef: { name: 'Chef Ravi Kumar' },
          estimatedTime: 180,
          notes: 'Slow cook for 3 hours'
        }
      ];

      return await this.simulateApiCall(mockData, 600);
    } catch (error) {
      console.error('Error fetching cooking timeline:', error);
      throw new Error('Failed to load cooking timeline');
    }
  }

  static async updateCookingStatus(taskId: string, status: string, notes?: string): Promise<CookingTask> {
    try {
      const mockUpdatedTask: CookingTask = {
        id: taskId,
        dishName: 'Butter Chicken',
        category: 'Main Course',
        servings: 250,
        status: status,
        priority: 'HIGH',
        chef: { name: 'Chef Ravi Kumar' },
        estimatedTime: 120,
        notes: notes || 'Status updated successfully'
      };

      return await this.simulateApiCall(mockUpdatedTask, 400);
    } catch (error) {
      console.error('Error updating cooking status:', error);
      throw new Error('Failed to update cooking status');
    }
  }

  static async createIndent(eventId: string, items: any[]): Promise<any> {
    try {
      const mockIndent = {
        id: 'new-indent-id',
        eventId,
        status: 'DRAFT',
        totalItems: items.length,
        items: items.map((item, index) => ({
          id: `item-${index}`,
          ...item,
          isInStock: Math.random() > 0.3, // Random stock availability
          isReceived: false
        }))
      };

      return await this.simulateApiCall(mockIndent, 700);
    } catch (error) {
      console.error('Error creating indent:', error);
      throw new Error('Failed to create indent');
    }
  }

  static async addStock(stockData: any): Promise<StockItem> {
    try {
      const mockStock: StockItem = {
        id: 'new-stock-id',
        itemName: stockData.itemName,
        category: stockData.category,
        quantity: stockData.quantity,
        unit: stockData.unit,
        minStock: stockData.minStock
      };

      return await this.simulateApiCall(mockStock, 500);
    } catch (error) {
      console.error('Error adding stock:', error);
      throw new Error('Failed to add stock item');
    }
  }
}

export default KitchenService;
export type { DashboardData, KitchenEvent, CookingTask, StockItem, DashboardStats };