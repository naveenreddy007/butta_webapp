// Kitchen Module Types
// Re-export Prisma types for convenience and add custom types

import { Priority } from '@prisma/client';

import { CookingStatus } from '@prisma/client';

import { EventStatus } from '@prisma/client';

import { CookingStatus } from '@prisma/client';

import { Stock } from '@prisma/client';

import { CookingLog } from '@prisma/client';

import { Indent } from '@prisma/client';

import { User } from '@supabase/supabase-js';

export type {
  User,
  Event,
  Indent,
  IndentItem,
  Stock,
  StockUpdate,
  CookingLog,
  Leftover,
  UserRole,
  EventStatus,
  IndentStatus,
  StockUpdateType,
  CookingStatus,
  Priority
} from '../lib/prisma';

// Legacy aliases for backward compatibility
export type KitchenUser = User;
export type KitchenEvent = Event;

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
  status: CookingStatus;
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
  status?: EventStatus;
  assignedChef?: string;
}

export interface StockFilter {
  category?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
}

export interface CookingFilter {
  status?: CookingStatus;
  priority?: Priority;
  assignedTo?: string;
}