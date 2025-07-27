import type { MenuItem, MenuCategory } from '@/types';

// Validation functions for menu data
export function validateMenuItem(item: any): item is MenuItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.description === 'string' &&
    typeof item.price === 'number' &&
    item.price >= 0 &&
    typeof item.category === 'string' &&
    typeof item.available === 'boolean' &&
    (item.image === undefined || typeof item.image === 'string') &&
    (item.dietaryRestrictions === undefined || Array.isArray(item.dietaryRestrictions)) &&
    (item.specialNotes === undefined || typeof item.specialNotes === 'string')
  );
}

export function validateMenuCategory(category: any): category is MenuCategory {
  return (
    typeof category === 'object' &&
    category !== null &&
    typeof category.id === 'string' &&
    typeof category.name === 'string' &&
    typeof category.description === 'string' &&
    typeof category.order === 'number' &&
    category.order >= 0 &&
    (category.icon === undefined || typeof category.icon === 'string')
  );
}

export function validateMenuData(data: any): {
  isValid: boolean;
  errors: string[];
  categories: MenuCategory[];
  items: MenuItem[];
} {
  const errors: string[] = [];
  let categories: MenuCategory[] = [];
  let items: MenuItem[] = [];

  // Check if data exists
  if (!data || typeof data !== 'object') {
    errors.push('Menu data is missing or invalid');
    return { isValid: false, errors, categories, items };
  }

  // Validate categories
  if (!data.categories || !Array.isArray(data.categories)) {
    errors.push('Categories array is missing or invalid');
  } else {
    const validCategories: MenuCategory[] = [];
    data.categories.forEach((category: any, index: number) => {
      if (validateMenuCategory(category)) {
        validCategories.push(category);
      } else {
        errors.push(`Invalid category at index ${index}: ${JSON.stringify(category)}`);
      }
    });
    categories = validCategories;
  }

  // Validate items
  if (!data.items || !Array.isArray(data.items)) {
    errors.push('Items array is missing or invalid');
  } else {
    const validItems: MenuItem[] = [];
    data.items.forEach((item: any, index: number) => {
      if (validateMenuItem(item)) {
        validItems.push(item);
      } else {
        errors.push(`Invalid menu item at index ${index}: ${JSON.stringify(item)}`);
      }
    });
    items = validItems;
  }

  // Check for orphaned items (items without valid categories)
  const categoryIds = new Set(categories.map(cat => cat.id));
  const orphanedItems = items.filter(item => !categoryIds.has(item.category));
  if (orphanedItems.length > 0) {
    errors.push(`Found ${orphanedItems.length} items with invalid categories`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    categories,
    items: items.filter(item => categoryIds.has(item.category)) // Remove orphaned items
  };
}

// Utility functions for menu data processing
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
}

export function getDietaryRestrictionLabel(restriction: string): string {
  const labels: Record<string, string> = {
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    'gluten-free': 'Gluten Free',
    'dairy-free': 'Dairy Free',
    'nut-free': 'Nut Free',
    'low-sodium': 'Low Sodium',
    'low-carb': 'Low Carb',
  };
  return labels[restriction] || restriction;
}

export function getDietaryRestrictionColor(restriction: string): string {
  const colors: Record<string, string> = {
    vegetarian: 'bg-green-100 text-green-800',
    vegan: 'bg-emerald-100 text-emerald-800',
    'gluten-free': 'bg-blue-100 text-blue-800',
    'dairy-free': 'bg-purple-100 text-purple-800',
    'nut-free': 'bg-orange-100 text-orange-800',
    'low-sodium': 'bg-yellow-100 text-yellow-800',
    'low-carb': 'bg-red-100 text-red-800',
  };
  return colors[restriction] || 'bg-gray-100 text-gray-800';
}