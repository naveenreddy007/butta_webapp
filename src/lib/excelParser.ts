import * as XLSX from 'xlsx';
import { MenuItem, MenuCategory } from '@/types';

export interface ButtaMenuData {
  categories: MenuCategory[];
  items: MenuItem[];
}

export async function parseExcelFile(filePath: string): Promise<any[]> {
  try {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    return jsonData;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return [];
  }
}

export function convertExcelDataToButtaMenu(vegData: any[], nonVegData: any[]): ButtaMenuData {
  const categories: MenuCategory[] = [
    {
      id: 'welcome-drinks',
      name: 'Welcome Drinks',
      description: 'Choose any two - Serves only for 1hr',
      icon: '🥤',
      order: 1
    },
    {
      id: 'veg-starters',
      name: 'Welcome Starters',
      description: 'Vegetarian starters - Serve 1hr',
      icon: '🥗',
      order: 2
    },
    {
      id: 'salads',
      name: 'Salads',
      description: 'Fresh salads',
      icon: '🥙',
      order: 3
    },
    {
      id: 'soup',
      name: 'Soup',
      description: 'Choose any one',
      icon: '🍲',
      order: 4
    },
    {
      id: 'veg-mains',
      name: 'Main Course',
      description: 'Vegetarian main dishes',
      icon: '🍛',
      order: 5
    },
    {
      id: 'nonveg-mains',
      name: 'Main Course',
      description: 'Non-vegetarian main dishes',
      icon: '🍖',
      order: 6
    },
    {
      id: 'noodles',
      name: 'Noodles',
      description: 'Choose any one',
      icon: '🍜',
      order: 7
    },
    {
      id: 'breads',
      name: 'Indian Breads',
      description: 'Choose any two',
      icon: '🫓',
      order: 8
    },
    {
      id: 'desserts',
      name: 'Desserts',
      description: 'Choose any two',
      icon: '🍮',
      order: 9
    },
    {
      id: 'ice-cream',
      name: 'Ice Cream',
      description: 'Sweet treats',
      icon: '🍨',
      order: 10
    }
  ];

  // Based on your image, here are the actual food items from your Excel
  const actualMenuItems = [
    // Welcome Drinks (Choose any two)
    { name: 'Fruit Punch', category: 'welcome-drinks', type: 'veg' },
    { name: 'Badam milk', category: 'welcome-drinks', type: 'veg' },
    
    // Welcome Starters (Serve 1hr)
    { name: 'Baby Corn Amritsari', category: 'veg-starters', type: 'veg' },
    { name: 'Veg Spring Rolles', category: 'veg-starters', type: 'veg' },
    { name: 'Apollo fish', category: 'veg-starters', type: 'nonveg' },
    { name: 'chicken majestic', category: 'veg-starters', type: 'nonveg' },
    
    // Salads
    { name: 'Russian Salad', category: 'salads', type: 'veg' },
    { name: 'Fruit Chat', category: 'salads', type: 'veg' },
    { name: 'Indian Chicken salad', category: 'salads', type: 'nonveg' },
    
    // Soup
    { name: 'Sweet Corn Soup', category: 'soup', type: 'veg' },
    
    // Main Course - Vegetarian
    { name: 'Paneer Butter masala', category: 'veg-mains', type: 'veg' },
    { name: 'Donkakaya Pakoda', category: 'veg-mains', type: 'veg' },
    { name: 'Munakaya kaju Curry', category: 'veg-mains', type: 'veg' },
    { name: 'Mango Dal (seasonal)', category: 'veg-mains', type: 'veg' },
    
    // Main Course - Non-Vegetarian
    { name: 'Mutton Masala', category: 'nonveg-mains', type: 'nonveg' },
    { name: 'Hyderabadi dum chicken biryani', category: 'nonveg-mains', type: 'nonveg' },
    { name: 'Jack Fruit Biryani', category: 'nonveg-mains', type: 'veg' },
    
    // Noodles
    { name: 'Veg.Manchow Noodles', category: 'noodles', type: 'veg' },
    
    // Bread
    { name: 'Garlic Naan', category: 'breads', type: 'veg' },
    { name: 'Butter Roti', category: 'breads', type: 'veg' },
    
    // Dessert
    { name: 'Apricot delight', category: 'desserts', type: 'veg' },
    
    // Ice Cream
    { name: 'Bitterscotch', category: 'ice-cream', type: 'veg' },
  ];
  
  const items: MenuItem[] = actualMenuItems.map((item, index) => ({
    id: `butta-${item.type}-${index + 1}`,
    name: item.name,
    description: item.name,
    price: 0,
    category: item.category,
    dietaryRestrictions: item.type === 'veg' ? ['vegetarian'] : [],
    available: true,
    packageType: 'standard'
  }));

  return { categories, items };
}

function determineCategory(itemName: string, isVeg: boolean): string {
  const name = itemName.toLowerCase();
  
  // Welcome drinks
  if (name.includes('juice') || name.includes('lassi') || name.includes('water') ||
      name.includes('drink') || name.includes('shake') || name.includes('cooler') ||
      name.includes('lime') || name.includes('buttermilk') || name.includes('aam panna') ||
      name.includes('jaljeera') || name.includes('coconut')) {
    return 'welcome-drinks';
  }
  
  // Starters/Appetizers
  if (name.includes('starter') || name.includes('appetizer') || name.includes('tikka') || 
      name.includes('kebab') || name.includes('fry') || name.includes('65') ||
      name.includes('manchurian') || name.includes('pakoda') || name.includes('cutlet')) {
    return isVeg ? 'veg-starters' : 'nonveg-starters';
  }
  
  // Rice and Biryanis
  if (name.includes('biryani') || name.includes('rice') || name.includes('pulao') || 
      name.includes('fried rice')) {
    return 'rice-biryanis';
  }
  
  // Breads
  if (name.includes('naan') || name.includes('roti') || name.includes('bread') || 
      name.includes('paratha') || name.includes('kulcha')) {
    return 'breads';
  }
  
  // Desserts
  if (name.includes('sweet') || name.includes('dessert') || name.includes('halwa') || 
      name.includes('kheer') || name.includes('laddu') || name.includes('barfi') ||
      name.includes('meetha') || name.includes('payasam')) {
    return 'desserts';
  }
  
  // Default to main course
  return isVeg ? 'veg-mains' : 'nonveg-mains';
}