/**
 * Shared Integration Configuration
 * 
 * This file contains configuration that ensures consistency between
 * the Kitchen Module and Event Menu Planner systems.
 */

import { buttaBusinessInfo } from '../../src/data/businessInfo';

export interface SystemConfig {
  name: string;
  version: string;
  baseUrl: string;
  apiEndpoint: string;
  features: string[];
}

export interface IntegrationConfig {
  kitchen: SystemConfig;
  menuPlanner: SystemConfig;
  shared: {
    businessInfo: typeof buttaBusinessInfo;
    branding: typeof buttaBusinessInfo.branding;
    contact: typeof buttaBusinessInfo.contact;
  };
  sync: {
    enabled: boolean;
    realTimeUpdates: boolean;
    autoCreateIndents: boolean;
    autoAssignChefs: boolean;
    bufferPercentage: number;
    syncInterval: number; // in milliseconds
  };
  routes: {
    kitchen: {
      dashboard: string;
      events: string;
      indents: string;
      cooking: string;
      stock: string;
      reports: string;
    };
    menuPlanner: {
      dashboard: string;
      events: string;
      menus: string;
      customers: string;
    };
  };
}

export const integrationConfig: IntegrationConfig = {
  kitchen: {
    name: 'Kitchen Module',
    version: '1.0.0',
    baseUrl: '/kitchen',
    apiEndpoint: '/api/kitchen',
    features: [
      'indent_management',
      'cooking_tracking',
      'stock_management',
      'real_time_updates',
      'role_based_access'
    ]
  },
  
  menuPlanner: {
    name: 'Event Menu Planner',
    version: '1.0.0',
    baseUrl: '/menu-planner',
    apiEndpoint: '/api/menu-planner',
    features: [
      'event_planning',
      'menu_selection',
      'customer_management',
      'pricing_calculation',
      'pdf_generation'
    ]
  },
  
  shared: {
    businessInfo: buttaBusinessInfo,
    branding: buttaBusinessInfo.branding,
    contact: buttaBusinessInfo.contact
  },
  
  sync: {
    enabled: true,
    realTimeUpdates: true,
    autoCreateIndents: true,
    autoAssignChefs: false,
    bufferPercentage: 10,
    syncInterval: 5000 // 5 seconds
  },
  
  routes: {
    kitchen: {
      dashboard: '/kitchen',
      events: '/kitchen/events',
      indents: '/kitchen/indents',
      cooking: '/kitchen/cooking',
      stock: '/kitchen/stock',
      reports: '/kitchen/reports'
    },
    menuPlanner: {
      dashboard: '/menu-planner',
      events: '/menu-planner/events',
      menus: '/menu-planner/menus',
      customers: '/menu-planner/customers'
    }
  }
};

/**
 * Category mapping between systems
 */
export const categoryMapping = {
  // Menu Planner -> Kitchen Module
  menuToKitchen: {
    'starters': 'Appetizers',
    'biryanis': 'Main Course',
    'curries': 'Main Course',
    'breads': 'Breads',
    'desserts': 'Desserts',
    'beverages': 'Beverages'
  },
  
  // Kitchen Module -> Menu Planner
  kitchenToMenu: {
    'Appetizers': 'starters',
    'Main Course': 'biryanis', // Default to biryanis for main course
    'Breads': 'breads',
    'Desserts': 'desserts',
    'Beverages': 'beverages'
  }
};

/**
 * Quantity estimation rules
 */
export const quantityRules = {
  // Base quantity per person by category (in kg unless specified)
  baseQuantities: {
    'Appetizers': {
      vegetarian: 0.1,
      nonVegetarian: 0.15,
      unit: 'kg'
    },
    'Main Course': {
      biryani: 0.25,
      curry: 0.2,
      unit: 'kg'
    },
    'Breads': {
      quantity: 2,
      unit: 'pieces'
    },
    'Desserts': {
      quantity: 0.1,
      unit: 'kg'
    },
    'Beverages': {
      quantity: 0.2,
      unit: 'liters'
    }
  },
  
  // Buffer percentages by category
  bufferPercentages: {
    'Appetizers': 15,
    'Main Course': 10,
    'Breads': 20,
    'Desserts': 10,
    'Beverages': 15
  },
  
  // Cooking time estimates (in minutes)
  cookingTimes: {
    'Appetizers': 30,
    'Main Course': {
      biryani: 90,
      curry: 60,
      default: 60
    },
    'Breads': 20,
    'Desserts': 45,
    'Beverages': 15
  }
};

/**
 * User role mappings between systems
 */
export const roleMapping = {
  kitchen: {
    CHEF: {
      permissions: ['view_assigned_tasks', 'update_cooking_status', 'view_basic_inventory'],
      menuPlannerAccess: false
    },
    KITCHEN_MANAGER: {
      permissions: ['manage_indents', 'assign_tasks', 'manage_inventory', 'view_reports'],
      menuPlannerAccess: true
    },
    ADMIN: {
      permissions: ['full_access', 'user_management', 'system_configuration'],
      menuPlannerAccess: true
    }
  }
};

/**
 * API endpoints for cross-system communication
 */
export const apiEndpoints = {
  kitchen: {
    events: '/api/kitchen/events',
    indents: '/api/kitchen/indents',
    cooking: '/api/kitchen/cooking',
    stock: '/api/kitchen/stock',
    sync: '/api/kitchen/sync'
  },
  menuPlanner: {
    events: '/api/menu-planner/events',
    menus: '/api/menu-planner/menus',
    customers: '/api/menu-planner/customers',
    sync: '/api/menu-planner/sync'
  }
};

/**
 * Validation rules for data consistency
 */
export const validationRules = {
  event: {
    requiredFields: ['name', 'date', 'guestCount', 'eventType'],
    maxGuestCount: 1000,
    minGuestCount: 10,
    maxNameLength: 100
  },
  menuItem: {
    requiredFields: ['name', 'category', 'price'],
    maxNameLength: 50,
    maxDescriptionLength: 200,
    minPrice: 0
  },
  indent: {
    maxItems: 100,
    minQuantity: 0.1,
    maxQuantity: 1000
  }
};

/**
 * Error codes for cross-system communication
 */
export const errorCodes = {
  SYNC_FAILED: 'SYNC_001',
  INVALID_DATA: 'SYNC_002',
  PERMISSION_DENIED: 'SYNC_003',
  SYSTEM_UNAVAILABLE: 'SYNC_004',
  DATA_CONFLICT: 'SYNC_005'
};

/**
 * Get configuration for specific environment
 */
export function getEnvironmentConfig(env: 'development' | 'staging' | 'production'): Partial<IntegrationConfig> {
  const baseConfig = {
    development: {
      sync: {
        ...integrationConfig.sync,
        syncInterval: 2000, // Faster sync in development
        enabled: true
      }
    },
    staging: {
      sync: {
        ...integrationConfig.sync,
        syncInterval: 5000,
        enabled: true
      }
    },
    production: {
      sync: {
        ...integrationConfig.sync,
        syncInterval: 10000, // Slower sync in production
        enabled: true
      }
    }
  };

  return baseConfig[env] || baseConfig.development;
}

/**
 * Validate integration configuration
 */
export function validateConfig(config: IntegrationConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!config.shared.businessInfo.name) {
    errors.push('Business name is required');
  }

  if (!config.shared.businessInfo.contact.phone) {
    errors.push('Business phone is required');
  }

  if (!config.shared.businessInfo.contact.email) {
    errors.push('Business email is required');
  }

  // Check sync configuration
  if (config.sync.bufferPercentage < 0 || config.sync.bufferPercentage > 50) {
    errors.push('Buffer percentage must be between 0 and 50');
  }

  if (config.sync.syncInterval < 1000) {
    errors.push('Sync interval must be at least 1000ms');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get system information
 */
export function getSystemInfo() {
  return {
    kitchen: integrationConfig.kitchen,
    menuPlanner: integrationConfig.menuPlanner,
    lastUpdated: new Date().toISOString(),
    configVersion: '1.0.0'
  };
}