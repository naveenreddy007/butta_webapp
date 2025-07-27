export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  dietaryRestrictions?: string[];
  specialNotes?: string;
  available: boolean;
  packageType?: 'standard' | 'choose-any' | 'addon';
  maxSelections?: number; // For "choose any X" items
  servingTime?: string; // e.g., "1hr"
  isAddon?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
}

export interface MenuSelection {
  item: MenuItem;
  quantity: number;
  notes?: string;
  isAddon?: boolean;
  packageGroup?: string; // For grouping "choose any X" items
}

export interface BusinessInfo {
  name: string;
  logo: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface MenuState {
  selectedItems: MenuSelection[];
  totalPrice: number;
}