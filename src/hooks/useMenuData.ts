import { useState, useEffect } from 'react';
import type { MenuItem, MenuCategory } from '@/types';
import menuData from '@/data/menu.json';
import { validateMenuData } from '@/lib/menuValidation';

interface UseMenuDataReturn {
  categories: MenuCategory[];
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  getItemsByCategory: (categoryId: string) => MenuItem[];
  getCategoryById: (categoryId: string) => MenuCategory | undefined;
  getItemById: (itemId: string) => MenuItem | undefined;
  refreshData: () => Promise<void>;
}

export function useMenuData(): UseMenuDataReturn {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenuData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validate the menu data
      const validation = validateMenuData(menuData);
      
      if (!validation.isValid) {
        throw new Error(`Menu data validation failed: ${validation.errors.join(', ')}`);
      }

      // Sort categories by order
      const sortedCategories = validation.categories.sort((a, b) => a.order - b.order);
      
      // Filter only available items
      const availableItems = validation.items.filter(item => item.available);

      setCategories(sortedCategories);
      setItems(availableItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error loading menu data:', err);
      
      // Set fallback data in case of error
      setCategories([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getItemsByCategory = (categoryId: string): MenuItem[] => {
    return items.filter(item => item.category === categoryId);
  };

  const getCategoryById = (categoryId: string): MenuCategory | undefined => {
    return categories.find(category => category.id === categoryId);
  };

  const getItemById = (itemId: string): MenuItem | undefined => {
    return items.find(item => item.id === itemId);
  };

  const refreshData = async (): Promise<void> => {
    await loadMenuData();
  };

  // Load data on mount
  useEffect(() => {
    loadMenuData();
  }, []);

  return {
    categories,
    items,
    loading,
    error,
    getItemsByCategory,
    getCategoryById,
    getItemById,
    refreshData,
  };
}