// Prisma Client Configuration
// This replaces the direct Supabase client for type-safe database operations

import { PrismaClient } from '@prisma/client';

// Global variable to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with proper configuration
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper function to handle Prisma client disconnection
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// Helper function to check database connection
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, error: null };
  } catch (error) {
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Export types for use in other files
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
} from '@prisma/client';