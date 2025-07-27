import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MenuItem } from '@/types';

export interface ButtaMenuSelection {
  item: MenuItem;
  quantity: number;
  isAddOn: boolean; // True if this item exceeds the category limit
}

export interface CategoryLimit {
  categoryId: string;
  limit: number;
  name: string;
}

export interface ButtaMenuState {
  selectedItems: ButtaMenuSelection[];
  categoryLimits: CategoryLimit[];
  totalPrice: number;
  totalAddOnPrice: number;
}

type ButtaMenuAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_SELECTIONS' }
  | { type: 'SET_CATEGORY_LIMITS'; payload: CategoryLimit[] };

const initialState: ButtaMenuState = {
  selectedItems: [],
  categoryLimits: [
    { categoryId: 'veg-starters', limit: 2, name: 'Veg Starters' },
    { categoryId: 'veg-mains', limit: 3, name: 'Veg Main Course' },
    { categoryId: 'nonveg-starters', limit: 2, name: 'Non-Veg Starters' },
    { categoryId: 'nonveg-mains', limit: 3, name: 'Non-Veg Main Course' },
    { categoryId: 'rice-biryanis', limit: 2, name: 'Rice & Biryanis' },
    { categoryId: 'breads', limit: 3, name: 'Breads' },
    { categoryId: 'desserts', limit: 2, name: 'Desserts' },
    { categoryId: 'beverages', limit: 2, name: 'Beverages' }
  ],
  totalPrice: 0,
  totalAddOnPrice: 0
};

function buttaMenuReducer(state: ButtaMenuState, action: ButtaMenuAction): ButtaMenuState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item } = action.payload;
      const existingIndex = state.selectedItems.findIndex(s => s.item.id === item.id);
      
      if (existingIndex >= 0) {
        // Item already exists, increase quantity
        const updatedItems = [...state.selectedItems];
        updatedItems[existingIndex].quantity += 1;
        return recalculateAddOns({ ...state, selectedItems: updatedItems });
      } else {
        // New item
        const newSelection: ButtaMenuSelection = {
          item,
          quantity: 1,
          isAddOn: false // Will be recalculated
        };
        const updatedItems = [...state.selectedItems, newSelection];
        return recalculateAddOns({ ...state, selectedItems: updatedItems });
      }
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.selectedItems.filter(s => s.item.id !== action.payload.itemId);
      return recalculateAddOns({ ...state, selectedItems: updatedItems });
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return buttaMenuReducer(state, { type: 'REMOVE_ITEM', payload: { itemId } });
      }
      
      const updatedItems = state.selectedItems.map(s =>
        s.item.id === itemId ? { ...s, quantity } : s
      );
      return recalculateAddOns({ ...state, selectedItems: updatedItems });
    }

    case 'CLEAR_SELECTIONS':
      return { ...state, selectedItems: [], totalPrice: 0, totalAddOnPrice: 0 };

    case 'SET_CATEGORY_LIMITS':
      return recalculateAddOns({ ...state, categoryLimits: action.payload });

    default:
      return state;
  }
}

function recalculateAddOns(state: ButtaMenuState): ButtaMenuState {
  const updatedItems = [...state.selectedItems];
  let totalPrice = 0;
  let totalAddOnPrice = 0;

  // Group items by category
  const itemsByCategory = updatedItems.reduce((acc, selection) => {
    const categoryId = selection.item.category;
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(selection);
    return acc;
  }, {} as Record<string, ButtaMenuSelection[]>);

  // Calculate add-ons for each category
  Object.entries(itemsByCategory).forEach(([categoryId, selections]) => {
    const categoryLimit = state.categoryLimits.find(cl => cl.categoryId === categoryId);
    const limit = categoryLimit?.limit || 0;

    // Sort by quantity (higher quantity items get priority for base selection)
    selections.sort((a, b) => b.quantity - a.quantity);

    let itemsInCategory = 0;
    selections.forEach(selection => {
      const itemQuantity = selection.quantity;
      
      if (itemsInCategory < limit) {
        // Items within limit
        const baseQuantity = Math.min(itemQuantity, limit - itemsInCategory);
        const addOnQuantity = itemQuantity - baseQuantity;
        
        selection.isAddOn = false;
        totalPrice += baseQuantity * (selection.item.price || 0);
        
        if (addOnQuantity > 0) {
          totalAddOnPrice += addOnQuantity * (selection.item.price || 0);
        }
        
        itemsInCategory += baseQuantity;
      } else {
        // All items are add-ons
        selection.isAddOn = true;
        totalAddOnPrice += itemQuantity * (selection.item.price || 0);
      }
    });
  });

  return {
    ...state,
    selectedItems: updatedItems,
    totalPrice,
    totalAddOnPrice
  };
}

const ButtaMenuContext = createContext<{
  state: ButtaMenuState;
  dispatch: React.Dispatch<ButtaMenuAction>;
} | null>(null);

export function ButtaMenuProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(buttaMenuReducer, initialState);

  return (
    <ButtaMenuContext.Provider value={{ state, dispatch }}>
      {children}
    </ButtaMenuContext.Provider>
  );
}

export function useButtaMenu() {
  const context = useContext(ButtaMenuContext);
  if (!context) {
    throw new Error('useButtaMenu must be used within a ButtaMenuProvider');
  }
  return context;
}

// Helper functions
export function getCategorySelections(state: ButtaMenuState, categoryId: string) {
  return state.selectedItems.filter(s => s.item.category === categoryId);
}

export function getCategoryCount(state: ButtaMenuState, categoryId: string) {
  return getCategorySelections(state, categoryId).reduce((sum, s) => sum + s.quantity, 0);
}

export function getCategoryLimit(state: ButtaMenuState, categoryId: string) {
  return state.categoryLimits.find(cl => cl.categoryId === categoryId)?.limit || 0;
}

export function isItemSelected(state: ButtaMenuState, itemId: string) {
  return state.selectedItems.find(s => s.item.id === itemId);
}