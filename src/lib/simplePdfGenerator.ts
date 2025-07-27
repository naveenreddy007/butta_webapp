import jsPDF from 'jspdf';

export function generateSimplePDF(): void {
  try {
    console.log('Starting simple PDF generation...');
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add some text
    doc.setFontSize(16);
    doc.text('Test PDF Generation', 20, 20);
    doc.text('This is a test to see if PDF generation works', 20, 40);
    
    // Save the PDF
    doc.save('test-pdf.pdf');
    
    console.log('Simple PDF generated successfully!');
    
  } catch (error) {
    console.error('Error in simple PDF generation:', error);
    throw error;
  }
}

export function generateButtaMenuPDF(selections: any[], customerInfo?: any): void {
  try {
    console.log('Starting Butta menu PDF generation...');
    
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    // Add header with date - exactly like your reference
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    const today = new Date();
    const dateStr = `${today.getDate()}${getOrdinalSuffix(today.getDate())}${today.toLocaleDateString('en-US', { month: 'long' })} ${today.getFullYear()} Dinner ${customerInfo?.guestCount || 280}Pax`;
    const dateWidth = doc.getTextWidth(dateStr);
    const dateX = (pageWidth - dateWidth) / 2;
    doc.text(dateStr, dateX, currentY);
    
    currentY += 30;

    // Group selections by category exactly like your reference
    const itemsByCategory = groupSelectionsByCategory(selections);

    // Setup two-column layout
    const leftColumnX = margin;
    const rightColumnX = pageWidth / 2 + 10;
    const columnWidth = (pageWidth / 2) - margin - 10;

    // Left column categories (exactly like your reference)
    const leftCategories = [
      { id: 'welcome-drinks', title: 'WELCOME DRINKS (Serve 1hr)' },
      { id: 'veg-starters', title: 'WELCOME STARTERS (Serve 1hr)' },
      { id: 'salads', title: 'SALADS' },
      { id: 'soup', title: 'SOUP' },
      { id: 'veg-mains', title: 'MAIN COURSE' },
      { id: 'nonveg-mains', title: 'MAIN COURSE' }
    ];

    // Right column categories
    const rightCategories = [
      { id: 'noodles', title: 'NOODLES' },
      { id: 'breads', title: 'BREAD' },
      { id: 'desserts', title: 'DESSERT' },
      { id: 'ice-cream', title: 'ICE CREAM' }
    ];

    let leftColumnY = currentY;
    let rightColumnY = currentY;

    // Render left column
    leftCategories.forEach(category => {
      if (itemsByCategory[category.id] && itemsByCategory[category.id].length > 0) {
        leftColumnY = addMenuCategory(doc, category.title, itemsByCategory[category.id], leftColumnX, columnWidth, leftColumnY);
        leftColumnY += 15;
      }
    });

    // Render right column
    rightCategories.forEach(category => {
      if (itemsByCategory[category.id] && itemsByCategory[category.id].length > 0) {
        rightColumnY = addMenuCategory(doc, category.title, itemsByCategory[category.id], rightColumnX, columnWidth, rightColumnY);
        rightColumnY += 15;
      }
    });

    // Add ACCOMPLIMENTS section (exactly like your reference)
    rightColumnY = addAccompliments(doc, rightColumnX, columnWidth, rightColumnY);
    
    // Add Sauces section (exactly like your reference)
    rightColumnY = addSauces(doc, rightColumnX, columnWidth, rightColumnY);

    // Generate filename and download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Butta_Menu_${timestamp}.pdf`;
    
    doc.save(filename);
    
    console.log('Butta menu PDF generated successfully!');
    
  } catch (error) {
    console.error('Error in Butta menu PDF generation:', error);
    throw error;
  }
}

function groupSelectionsByCategory(selections: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  selections.forEach(selection => {
    const categoryId = selection.item.category;
    if (!grouped[categoryId]) {
      grouped[categoryId] = [];
    }
    grouped[categoryId].push(selection);
  });
  
  return grouped;
}

function addMenuCategory(doc: jsPDF, title: string, items: any[], x: number, width: number, startY: number): number {
  let currentY = startY;
  
  // Category title - bold and underlined like your reference
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(title, x, currentY);
  
  // Underline
  const titleWidth = doc.getTextWidth(title);
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.5);
  doc.line(x, currentY + 2, x + titleWidth, currentY + 2);
  
  currentY += 15;

  // Items - exactly like your reference format
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  items.forEach((selection, index) => {
    const itemText = `${index + 1}. ${selection.item.name}`;
    const lines = doc.splitTextToSize(itemText, width);
    doc.text(lines, x, currentY);
    currentY += lines.length * 6;
  });

  return currentY;
}

function addAccompliments(doc: jsPDF, x: number, width: number, startY: number): number {
  let currentY = startY;
  
  // Title - exactly like your reference
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  
  const title = 'ACCOMPLIMENTS:';
  doc.text(title, x, currentY);
  
  // Underline
  const titleWidth = doc.getTextWidth(title);
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.5);
  doc.line(x, currentY + 2, x + titleWidth, currentY + 2);
  
  currentY += 15;

  // Content - exactly like your reference
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const accompliments = [
    'Plain Rice, Samber, Curd, Pickle, papad,',
    'Chutneys, Fryums, Mirchi Ka Salan,',
    'Uluvacharu, Drinking Water, Seasonal',
    'Items depending on the Availability'
  ];

  accompliments.forEach(line => {
    const lines = doc.splitTextToSize(line, width);
    doc.text(lines, x, currentY);
    currentY += lines.length * 5;
  });

  return currentY + 15;
}

function addSauces(doc: jsPDF, x: number, width: number, startY: number): number {
  let currentY = startY;
  
  // Title - exactly like your reference
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  
  const title = 'Sauces:';
  doc.text(title, x, currentY);
  
  // Underline
  const titleWidth = doc.getTextWidth(title);
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.5);
  doc.line(x, currentY + 2, x + titleWidth, currentY + 2);
  
  currentY += 15;

  // Content - exactly like your reference
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const sauces = [
    'Hot Garlic Sauce, Tamato Sauce,',
    'Mayyonnaise, Pudin chutny'
  ];

  sauces.forEach(line => {
    const lines = doc.splitTextToSize(line, width);
    doc.text(lines, x, currentY);
    currentY += lines.length * 5;
  });

  return currentY + 15;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}