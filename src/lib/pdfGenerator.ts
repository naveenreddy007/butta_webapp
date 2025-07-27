import jsPDF from 'jspdf';
import type { MenuSelection, BusinessInfo } from '@/types';
import { formatPrice } from './menuValidation';

interface PDFGeneratorOptions {
  businessInfo: BusinessInfo;
  selections: MenuSelection[];
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    eventDate?: string;
    eventType?: string;
    guestCount?: number;
  };
}

export class MenuPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  generateMenuPDF(options: PDFGeneratorOptions): void {
    const { businessInfo, selections, customerInfo } = options;

    // Add header
    this.addHeader(businessInfo);
    
    // Add customer info if provided
    if (customerInfo) {
      this.addCustomerInfo(customerInfo);
    }

    // Add menu selections
    this.addMenuSelections(selections);

    // Add footer
    this.addFooter(businessInfo);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${businessInfo.name.replace(/\s+/g, '_')}_Menu_${timestamp}.pdf`;

    // Download the PDF
    this.doc.save(filename);
  }

  private addHeader(businessInfo: BusinessInfo): void {
    // Business name
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(40, 40, 40);
    
    const businessNameWidth = this.doc.getTextWidth(businessInfo.name);
    const businessNameX = (this.pageWidth - businessNameWidth) / 2;
    this.doc.text(businessInfo.name, businessNameX, this.currentY);
    
    this.currentY += 10;

    // Tagline
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    
    const tagline = 'Professional Catering Services';
    const taglineWidth = this.doc.getTextWidth(tagline);
    const taglineX = (this.pageWidth - taglineWidth) / 2;
    this.doc.text(tagline, taglineX, this.currentY);
    
    this.currentY += 15;

    // Contact info
    this.doc.setFontSize(10);
    this.doc.setTextColor(80, 80, 80);
    
    const contactInfo = [
      `Phone: ${businessInfo.contact.phone}`,
      `Email: ${businessInfo.contact.email}`,
      `Address: ${businessInfo.contact.address}`
    ];

    contactInfo.forEach(info => {
      const infoWidth = this.doc.getTextWidth(info);
      const infoX = (this.pageWidth - infoWidth) / 2;
      this.doc.text(info, infoX, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;

    // Decorative line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 15;
  }

  private addCustomerInfo(customerInfo: any): void {
    this.addPageBreakIfNeeded(60);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(40, 40, 40);
    this.doc.text('Event Details', this.margin, this.currentY);
    
    this.currentY += 12;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);

    const details = [
      customerInfo.name && `Customer: ${customerInfo.name}`,
      customerInfo.email && `Email: ${customerInfo.email}`,
      customerInfo.phone && `Phone: ${customerInfo.phone}`,
      customerInfo.eventDate && `Event Date: ${customerInfo.eventDate}`,
      customerInfo.eventType && `Event Type: ${customerInfo.eventType}`,
      customerInfo.guestCount && `Guest Count: ${customerInfo.guestCount}`,
    ].filter(Boolean);

    // Create a neat box for customer info
    if (details.length > 0) {
      this.doc.setFillColor(248, 249, 250);
      this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, details.length * 6 + 10, 'F');
      
      details.forEach(detail => {
        if (detail) {
          this.doc.text(detail, this.margin + 5, this.currentY);
          this.currentY += 6;
        }
      });
      
      this.currentY += 5;
    }

    this.currentY += 10;

    // Decorative line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 15;
  }

  private addMenuSelections(selections: MenuSelection[]): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(40, 40, 40);
    this.doc.text('Selected Menu Items', this.margin, this.currentY);
    
    this.currentY += 15;

    let grandTotal = 0;

    selections.forEach((selection, index) => {
      const { item, quantity } = selection;
      const itemTotal = item.price * quantity;
      grandTotal += itemTotal;

      // Check if we need a new page (more generous spacing)
      if (this.currentY > this.pageHeight - 80) {
        this.doc.addPage();
        this.currentY = this.margin + 20;
      }

      // Item container with border
      const itemStartY = this.currentY;
      const itemHeight = this.calculateItemHeight(item);
      
      // Light background for alternating rows
      if (index % 2 === 0) {
        this.doc.setFillColor(248, 249, 250);
        this.doc.rect(this.margin, itemStartY - 5, this.pageWidth - 2 * this.margin, itemHeight + 10, 'F');
      }

      // Item number and name
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(40, 40, 40);
      
      const itemNumber = `${index + 1}.`;
      this.doc.text(itemNumber, this.margin + 5, this.currentY);
      
      const itemNameLines = this.doc.splitTextToSize(item.name, 120);
      this.doc.text(itemNameLines, this.margin + 15, this.currentY);
      
      // Price and quantity on the right
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      
      const priceText = `${formatPrice(item.price)} x ${quantity}`;
      const totalText = `= ${formatPrice(itemTotal)}`;
      
      const priceWidth = this.doc.getTextWidth(priceText);
      const totalWidth = this.doc.getTextWidth(totalText);
      
      this.doc.text(priceText, this.pageWidth - this.margin - Math.max(priceWidth, totalWidth) - 5, this.currentY);
      
      this.currentY += itemNameLines.length * 5 + 2;
      
      // Total amount (bold)
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(40, 40, 40);
      this.doc.text(totalText, this.pageWidth - this.margin - totalWidth - 5, this.currentY);
      
      this.currentY += 8;

      // Description with proper wrapping
      if (item.description) {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(80, 80, 80);
        
        const descriptionLines = this.doc.splitTextToSize(item.description, this.pageWidth - 2 * this.margin - 20);
        this.doc.text(descriptionLines, this.margin + 15, this.currentY);
        this.currentY += descriptionLines.length * 4 + 3;
      }

      // Dietary restrictions with better formatting
      if (item.dietaryRestrictions && item.dietaryRestrictions.length > 0) {
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        
        const restrictionsText = `Dietary: ${item.dietaryRestrictions.join(', ')}`;
        this.doc.text(restrictionsText, this.margin + 15, this.currentY);
        this.currentY += 5;
      }

      // Special notes with better formatting
      if (item.specialNotes) {
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'italic');
        this.doc.setTextColor(120, 120, 120);
        
        const notesLines = this.doc.splitTextToSize(`Note: ${item.specialNotes}`, this.pageWidth - 2 * this.margin - 20);
        this.doc.text(notesLines, this.margin + 15, this.currentY);
        this.currentY += notesLines.length * 4 + 3;
      }

      this.currentY += 8; // Space between items
    });

    // Total section with better formatting
    this.currentY += 10;
    this.doc.setDrawColor(100, 100, 100);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 15;

    // Grand total with background
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.pageWidth - this.margin - 80, this.currentY - 8, 75, 20, 'F');
    
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(40, 40, 40);
    
    const totalLabel = 'Grand Total:';
    const totalValue = formatPrice(grandTotal);
    
    this.doc.text(totalLabel, this.pageWidth - this.margin - 75, this.currentY);
    this.doc.text(totalValue, this.pageWidth - this.margin - 75, this.currentY + 8);

    this.currentY += 25;
  }

  private calculateItemHeight(item: any): number {
    let height = 15; // Base height for name and price
    
    if (item.description) {
      const descLines = Math.ceil(item.description.length / 80); // Rough estimate
      height += descLines * 4 + 3;
    }
    
    if (item.dietaryRestrictions && item.dietaryRestrictions.length > 0) {
      height += 8;
    }
    
    if (item.specialNotes) {
      const noteLines = Math.ceil(item.specialNotes.length / 80);
      height += noteLines * 4 + 3;
    }
    
    return height + 8; // Extra padding
  }

  private addFooter(businessInfo: BusinessInfo): void {
    // Terms and conditions
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(80, 80, 80);
    this.doc.text('Terms & Conditions:', this.margin, this.currentY);
    
    this.currentY += 8;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(100, 100, 100);

    const terms = [
      '* All prices are subject to change based on final guest count and menu modifications.',
      '* A 50% deposit is required to confirm your booking.',
      '* Final guest count must be confirmed 48 hours before the event.',
      '* Cancellations made less than 72 hours before the event may incur charges.',
      '* We accommodate dietary restrictions with advance notice.',
    ];

    terms.forEach(term => {
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      const lines = this.doc.splitTextToSize(term, this.pageWidth - 2 * this.margin - 10);
      this.doc.text(lines, this.margin + 5, this.currentY);
      this.currentY += lines.length * 5 + 2;
    });

    // Footer info
    const footerY = this.pageHeight - 20;
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    
    const footerText = `Generated on ${new Date().toLocaleDateString()} | ${businessInfo.name}`;
    const footerWidth = this.doc.getTextWidth(footerText);
    this.doc.text(footerText, (this.pageWidth - footerWidth) / 2, footerY);
  }

  private addPageBreakIfNeeded(requiredSpace: number = 50): void {
    if (this.currentY > this.pageHeight - requiredSpace) {
      this.doc.addPage();
      this.currentY = this.margin + 20;
    }
  }
}

// Utility function to generate PDF
export function generateMenuPDF(options: PDFGeneratorOptions): void {
  const generator = new MenuPDFGenerator();
  generator.generateMenuPDF(options);
}