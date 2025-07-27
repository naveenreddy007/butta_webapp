import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { MenuItem, MenuSelection } from '@/types';

interface MenuSelectionState {
  selectedItems: MenuSelection[];
  totalPrice: number;
  totalItems: number;
}

type MenuSelectionAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface MenuSelectionContextType {
  state: MenuSelectionState;
  addItem: (item: MenuItem, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
}

const MenuSelectionContext = createContext<MenuSelectionContextType | undefined>(undefined);

function menuSelectionReducer(
  state: MenuSelectionState,
  action: MenuSelectionAction
): MenuSelectionState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity } = action.payload;
      const existingItemIndex = state.selectedItems.findIndex(
        selection => selection.item.id === item.id
      );

      let newSelectedItems: MenuSelection[];
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newSelectedItems = state.selectedItems.map((selection, index) =>
          index === existingItemIndex
            ? { ...selection, quantity: selection.quantity + quantity }
            : selection
        );
      } else {
        // Add new item
        newSelectedItems = [...state.selectedItems, { item, quantity }];
      }

      const totalPrice = newSelectedItems.reduce(
        (sum, selection) => sum + (selection.item.price * selection.quantity),
        0
      );
      
      const totalItems = newSelectedItems.reduce(
        (sum, selection) => sum + selection.quantity,
        0
      );

      return {
        selectedItems: newSelectedItems,
        totalPrice,
        totalItems,
      };
    }

    case 'REMOVE_ITEM': {
      const newSelectedItems = state.selectedItems.filter(
        selection => selection.item.id !== action.payload.itemId
      );

      const totalPrice = newSelectedItems.reduce(
        (sum, selection) => sum + (selection.item.price * selection.quantity),
        0
      );
      
      const totalItems = newSelectedItems.reduce(
        (sum, selection) => sum + selection.quantity,
        0
      );

      return {
        selectedItems: newSelectedItems,
        totalPrice,
        totalItems,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return menuSelectionReducer(state, { type: 'REMOVE_ITEM', payload: { itemId } });
      }

      const newSelectedItems = state.selectedItems.map(selection =>
        selection.item.id === itemId
          ? { ...selection, quantity }
          : selection
      );

      const totalPrice = newSelectedItems.reduce(
        (sum, selection) => sum + (selection.item.price * selection.quantity),
        0
      );
      
      const totalItems = newSelectedItems.reduce(
        (sum, selection) => sum + selection.quantity,
        0
      );

      return {
        selectedItems: newSelectedItems,
        totalPrice,
        totalItems,
      };
    }

    case 'CLEAR_CART': {
      return {
        selectedItems: [],
        totalPrice: 0,
        totalItems: 0,
      };
    }

    default:
      return state;
  }
}

const initialState: MenuSelectionState = {
  selectedItems: [],
  totalPrice: 0,
  totalItems: 0,
};

interface MenuSelectionProviderProps {
  children: ReactNode;
}

export function MenuSelectionProvider({ children }: MenuSelectionProviderProps) {
  const [state, dispatch] = useReducer(menuSelectionReducer, initialState);

  const addItem = (item: MenuItem, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (itemId: string): number => {
    const selection = state.selectedItems.find(
      selection => selection.item.id === itemId
    );
    return selection?.quantity || 0;
  };

  const contextValue: MenuSelectionContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };

  return (
    <MenuSelectionContext.Provider value={contextValue}>
      {children}
    </MenuSelectionContext.Provider>
  );
}

export function useMenuSelection() {
  const context = useContext(MenuSelectionContext);
  if (context === undefined) {
    throw new Error('useMenuSelection must be used within a MenuSelectionProvider');
  }
  return context;
}