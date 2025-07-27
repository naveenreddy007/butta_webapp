import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useButtaMenu, getCategoryLimit, getCategoryCount } from '@/context/ButtaMenuContext';
import { FileText, Download, Eye, X } from 'lucide-react';
import { generateButtaPDF } from '@/lib/buttaPdfGenerator';
import { generateButtaMenuPDF } from '@/lib/simplePdfGenerator';

interface ButtaMenuPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  businessInfo: {
    name: string;
    branding: {
      primaryColor: string;
      secondaryColor: string;
    };
  };
}

export function ButtaMenuPreview({ isOpen, onClose, businessInfo }: ButtaMenuPreviewProps) {
  const { state } = useButtaMenu();
  const { selectedItems, categoryLimits } = state;

  const baseItems = selectedItems.filter(s => !s.isAddOn);
  const addOnItems = selectedItems.filter(s => s.isAddOn);
  const totalItems = selectedItems.reduce((sum, s) => sum + s.quantity, 0);

  const handleDownloadPDF = () => {
    try {
      generateButtaMenuPDF(selectedItems, {
        eventDate: new Date().toLocaleDateString(),
        eventType: 'Catering Event',
        guestCount: 280
      });
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF: ' + (error as Error).message);
    }
  };

  // Group items by category
  const itemsByCategory = selectedItems.reduce((acc, selection) => {
    const categoryId = selection.item.category;
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(selection);
    return acc;
  }, {} as Record<string, any[]>);

  const renderMenuSection = (categoryId: string, title: string) => {
    const categoryItems = itemsByCategory[categoryId] || [];
    if (categoryItems.length === 0) return null;

    return (
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3 underline">
          {title}
        </h3>
        <div className="space-y-1">
          {categoryItems.map((selection, index) => (
            <div key={selection.item.id} className="text-sm text-gray-700">
              {index + 1}. {selection.item.name}
              {selection.quantity > 1 && (
                <span className="text-gray-500"> (x{selection.quantity})</span>
              )}
              {selection.isAddOn && (
                <span className="text-orange-600 text-xs ml-2">[Add-on]</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Preview Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden"
      >
        <Card className="h-full">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Menu Preview
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Header with Date */}
            <div className="p-6 text-center border-b bg-white">
              <h1 className="text-lg font-medium text-gray-600 mb-4">
                {new Date().toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                }).replace(' ', '')} Dinner 280Pax
              </h1>
            </div>

            {/* Menu Content in Two Columns */}
            <div className="p-8 bg-white">
              <div className="grid grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-8">
                  {renderMenuSection('welcome-drinks', 'WELCOME DRINKS (Serve 1hr)')}
                  {renderMenuSection('veg-starters', 'WELCOME STARTERS (Serve 1hr)')}
                  {renderMenuSection('nonveg-starters', 'SALADS')}
                  {renderMenuSection('veg-mains', 'SOUP')}
                  {renderMenuSection('nonveg-mains', 'MAIN COURSE')}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {renderMenuSection('rice-biryanis', 'NOODLES')}
                  {renderMenuSection('breads', 'BREAD')}
                  {renderMenuSection('desserts', 'DESSERT')}
                  {renderMenuSection('beverages', 'ICE CREAM')}
                  
                  {/* Accomplishments Section */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-3 underline">
                      ACCOMPLIMENTS:
                    </h3>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p>Plain Rice, Samber, Curd, Pickle, papad,</p>
                      <p>Chutneys, Fryums, Mirchi Ka Salan,</p>
                      <p>Uluvacharu, Drinking Water, Seasonal</p>
                      <p>Items depending on the Availability</p>
                    </div>
                  </div>

                  {/* Sauces Section */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-3 underline">
                      Sauces:
                    </h3>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p>Hot Garlic Sauce, Tamato Sauce,</p>
                      <p>Mayyonnaise, Pudin chutny</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Actions */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close Preview
              </Button>
              <Button 
                onClick={handleDownloadPDF}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

