import jsPDF from 'jspdf';
import type { ButtaMenuSelection, CategoryLimit } from '@/context/ButtaMenuContext';

interface ButtaPDFOptions {
  businessInfo: {
    name: string;
    branding: {
      primaryColor: string;
      secondaryColor: string;
    };
  };
  selections: ButtaMenuSelection[];
  categoryLimits: CategoryLimit[];
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    eventDate?: string;
    eventType?: string;
    guestCount?: number;
    eventTime?: string;
  };
}

export function generateButtaPDF(options: ButtaPDFOptions): void {
  try {
    const { businessInfo, selections, categoryLimits, customerInfo } = options;
    
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = margin;

    // Add header with date
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    const today = new Date();
    const dateStr = `${today.getDate()}${getOrdinalSuffix(today.getDate())} ${today.toLocaleDateString('en-US', { month: 'long' })} ${today.getFullYear()} Dinner ${customerInfo?.guestCount || 280}Pax`;
    const dateWidth = doc.getTextWidth(dateStr);
    const dateX = (pageWidth - dateWidth) / 2;
    doc.text(dateStr, dateX, currentY);
    
    currentY += 25;

    // Add customer info if provided
    if (customerInfo && customerInfo.name) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('Event Details:', margin, currentY);
      currentY += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      const details = [
        customerInfo.name && `Customer: ${customerInfo.name}`,
        customerInfo.phone && `Mobile: ${customerInfo.phone}`,
        customerInfo.email && `Email: ${customerInfo.email}`,
        customerInfo.guestCount && `Guests: ${customerInfo.guestCount}`,
        customerInfo.eventDate && `Date: ${customerInfo.eventDate}`,
        customerInfo.eventTime && `Time: ${customerInfo.eventTime}`,
        customerInfo.eventType && `Type: ${customerInfo.eventType}`,
      ].filter(Boolean);

      details.forEach(detail => {
        if (detail) {
          doc.text(detail, margin, currentY);
          currentY += 6;
        }
      });

      currentY += 15;
    }

    // Group items by category
    const itemsByCategory = selections.reduce((acc, selection) => {
      const categoryId = selection.item.category;
      if (!acc[categoryId]) acc[categoryId] = [];
      acc[categoryId].push(selection);
      return acc;
    }, {} as Record<string, ButtaMenuSelection[]>);

    // Define category mappings
    const categoryMappings: Record<string, string> = {
      'welcome-drinks': 'WELCOME DRINKS (Serve 1hr)',
      'veg-starters': 'WELCOME STARTERS (Serve 1hr)',
      'nonveg-starters': 'SALADS',
      'veg-mains': 'SOUP',
      'nonveg-mains': 'MAIN COURSE',
      'rice-biryanis': 'NOODLES',
      'breads': 'BREAD',
      'desserts': 'DESSERT',
      'beverages': 'ICE CREAM'
    };

    // Setup two-column layout
    const leftColumnX = margin;
    const rightColumnX = pageWidth / 2 + 10;
    const columnWidth = (pageWidth / 2) - margin - 10;

    // Left column categories
    const leftCategories = ['welcome-drinks', 'veg-starters', 'nonveg-starters', 'veg-mains', 'nonveg-mains'];
    // Right column categories  
    const rightCategories = ['rice-biryanis', 'breads', 'desserts', 'beverages'];

    let leftColumnY = currentY;
    let rightColumnY = currentY;

    // Render left column
    leftCategories.forEach(categoryId => {
      if (itemsByCategory[categoryId]) {
        const result = addMenuCategory(doc, categoryMappings[categoryId], itemsByCategory[categoryId], leftColumnX, columnWidth, leftColumnY);
        leftColumnY = result + 15;
      }
    });

    // Render right column
    rightCategories.forEach(categoryId => {
      if (itemsByCategory[categoryId]) {
        const result = addMenuCategory(doc, categoryMappings[categoryId], itemsByCategory[categoryId], rightColumnX, columnWidth, rightColumnY);
        rightColumnY = result + 15;
      }
    });

    // Add accomplishments and sauces to right column
    rightColumnY = addAccomplishments(doc, rightColumnX, columnWidth, rightColumnY);
    rightColumnY = addSauces(doc, rightColumnX, columnWidth, rightColumnY);

    // Generate filename and download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Butta_Convention_Menu_${timestamp}.pdf`;
    
    doc.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
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

function addMenuCategory(doc: jsPDF, title: string, items: ButtaMenuSelection[], x: number, width: number, startY: number): number {
  let currentY = startY;
  
  // Category title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(title, x, currentY);
  
  // Underline
  const titleWidth = doc.getTextWidth(title);
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.5);
  doc.line(x, currentY + 2, x + titleWidth, currentY + 2);
  
  currentY += 12;

  // Items
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  items.forEach((selection, index) => {
    let itemText = `${index + 1}. ${selection.item.name}`;
    if (selection.quantity > 1) {
      itemText += ` (x${selection.quantity})`;
    }
    if (selection.isAddOn) {
      itemText += ' [Add-on]';
    }

    const lines = doc.splitTextToSize(itemText, width);
    doc.text(lines, x, currentY);
    currentY += lines.length * 5;
  });

  return currentY;
}

function addAccompliments(doc: jsPDF, x: number, width: number, startY: number): number {
  let currentY = startY;
  
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
  
  currentY += 12;

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
    doc.text(line, x, currentY);
    currentY += 5;
  });

  return currentY + 10;
}

function addSauces(doc: jsPDF, x: number, width: number, startY: number): number {
  let currentY = startY;
  
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
  
  currentY += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const sauces = [
    'Hot Garlic Sauce, Tamato Sauce,',
    'Mayyonnaise, Pudin chutny'
  ];

  sauces.forEach(line => {
    doc.text(line, x, currentY);
    currentY += 5;
  });

  return currentY + 10;
}