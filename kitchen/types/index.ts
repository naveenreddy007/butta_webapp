// Kitchen Module Types

export enum UserRole {
  CHEF = 'CHEF',
  KITCHEN_MANAGER = 'KITCHEN_MANAGER',
  ADMIN = 'ADMIN'
}

export interface KitchenUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface KitchenEvent {
  id: string;
  name: string;
  date: Date;
  guestCount: number;
  eventType: string;
  status: 'PLANNED' | 'INDENT_CREATED' | 'COOKING_STARTED' | 'COOKING_COMPLETED' | 'EVENT_COMPLETED';
  menuItems?: any;
  assignedChef?: string;
  chef?: KitchenUser;
}

export interface Indent {
  id: string;
  eventId: string;
  event?: KitchenEvent;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  totalItems: number;
  createdBy: string;
  createdAt: Date;
  items: IndentItem[];
}

export interface IndentItem {
  id: string;
  indentId: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  isInStock: boolean;
  stockId?: string;
  stock?: Stock;
  isReceived: boolean;
  receivedAt?: Date;
  notes?: string;
}

export interface Stock {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate?: Date;
  batchNumber?: string;
  supplier?: string;
  costPerUnit?: number;
  isActive: boolean;
  minStock?: number;
}

export interface CookingLog {
  id: string;
  eventId: string;
  event?: KitchenEvent;
  dishName: string;
  category: string;
  servings: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  assignedTo: string;
  chef?: KitchenUser;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTime?: number;
  notes?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface Leftover {
  id: string;
  eventId: string;
  event?: KitchenEvent;
  itemName: string;
  quantity: number;
  unit: string;
  stockId?: string;
  stock?: Stock;
  isReturned: boolean;
  returnedAt?: Date;
  estimatedCost?: number;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard data
export interface DashboardData {
  todaysEvents: KitchenEvent[];
  pendingIndents: Indent[];
  activeCooking: CookingLog[];
  lowStockItems: Stock[];
  stats: {
    totalEvents: number;
    completedDishes: number;
    pendingDishes: number;
    stockItems: number;
  };
}

// Form types
export interface CreateIndentForm {
  eventId: string;
  items: {
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    notes?: string;
  }[];
}

export interface UpdateCookingStatusForm {
  id: string;
  status: CookingLog['status'];
  notes?: string;
  estimatedTime?: number;
}

export interface AddStockForm {
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

// Filter and search types
export interface EventFilter {
  date?: Date;
  status?: KitchenEvent['status'];
  assignedChef?: string;
}

export interface StockFilter {
  category?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
}

export interface CookingFilter {
  status?: CookingLog['status'];
  priority?: CookingLog['priority'];
  assignedTo?: string;
}