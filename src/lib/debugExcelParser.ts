import * as XLSX from 'xlsx';

export async function debugExcelFile(filePath: string): Promise<void> {
  try {
    console.log(`Debugging Excel file: ${filePath}`);
    
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    console.log('Sheet names:', workbook.SheetNames);
    
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Raw Excel data:');
    jsonData.forEach((row, index) => {
      if (index < 20) { // Show first 20 rows
        console.log(`Row ${index}:`, row);
      }
    });
    
    // Also try with different parsing options
    const jsonDataWithHeaders = XLSX.utils.sheet_to_json(worksheet);
    console.log('Excel data with headers:', jsonDataWithHeaders.slice(0, 10));
    
  } catch (error) {
    console.error('Error debugging Excel file:', error);
  }
}

export function createButtaMenuFromActualData(): any[] {
  // Based on your image, here are the actual food items
  const actualMenuItems = [
    // Welcome Drinks
    { name: 'Fruit Punch', category: 'welcome-drinks', type: 'veg' },
    { name: 'Badam milk', category: 'welcome-drinks', type: 'veg' },
    
    // Welcome Starters
    { name: 'Baby Corn Amritsari', category: 'veg-starters', type: 'veg' },
    { name: 'Veg Spring Rolles', category: 'veg-starters', type: 'veg' },
    { name: 'Apollo fish', category: 'nonveg-starters', type: 'nonveg' },
    { name: 'chicken majestic', category: 'nonveg-starters', type: 'nonveg' },
    
    // Salads
    { name: 'Russian Salad', category: 'salads', type: 'veg' },
    { name: 'Fruit Chat', category: 'salads', type: 'veg' },
    { name: 'Indian Chicken salad', category: 'salads', type: 'nonveg' },
    
    // Soup
    { name: 'Sweet Corn Soup', category: 'soup', type: 'veg' },
    
    // Main Course
    { name: 'Paneer Butter masala', category: 'veg-mains', type: 'veg' },
    { name: 'Donkakaya Pakoda', category: 'veg-mains', type: 'veg' },
    { name: 'Munakaya kaju Curry', category: 'veg-mains', type: 'veg' },
    { name: 'Mutton Masala', category: 'nonveg-mains', type: 'nonveg' },
    { name: 'Hyderabadi dum chicken biryani', category: 'nonveg-mains', type: 'nonveg' },
    { name: 'Mango Dal (seasonal)', category: 'veg-mains', type: 'veg' },
    { name: 'Jack Fruit Biryani', category: 'rice-biryanis', type: 'veg' },
    
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
  
  return actualMenuItems.map((item, index) => ({
    id: `butta-${item.type}-${index + 1}`,
    name: item.name,
    description: item.name,
    price: 0,
    category: item.category,
    dietaryRestrictions: item.type === 'veg' ? ['vegetarian'] : [],
    available: true,
    packageType: 'standard'
  }));
}