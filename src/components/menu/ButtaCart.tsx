import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, X, FileText, Eye } from 'lucide-react';
import { useButtaMenu, getCategoryCount } from '@/context/ButtaMenuContext';
import { ButtaMenuPreview } from './ButtaMenuPreview';
import { CustomerInfoModal } from './CustomerInfoModal';
import { generateButtaPDF } from '@/lib/buttaPdfGenerator';
import { generateSimplePDF, generateButtaMenuPDF } from '@/lib/simplePdfGenerator';
import type { BusinessInfo } from '@/types';
import { formatPrice } from '@/lib/menuValidation';

interface ButtaCartProps {
  businessInfo: BusinessInfo;
}

export function ButtaCart({ businessInfo }: ButtaCartProps) {
  const { state, dispatch } = useButtaMenu();
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(false);

  const totalItems = state.selectedItems.reduce((sum, s) => sum + s.quantity, 0);
  const baseItems = state.selectedItems.filter(s => !s.isAddOn);
  const addOnItems = state.selectedItems.filter(s => s.isAddOn);

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_SELECTIONS' });
  };

  const handleCustomerInfoSubmit = (customerInfo: any) => {
    try {
      console.log('Generating PDF with data:', {
        businessInfo,
        selections: state.selectedItems,
        categoryLimits: state.categoryLimits,
        customerInfo
      });
      
      // Try the simple PDF generator first
      generateButtaMenuPDF(state.selectedItems, {
        name: customerInfo.name,
        email: customerInfo.email || undefined,
        phone: customerInfo.mobile,
        eventDate: customerInfo.eventDate,
        eventType: customerInfo.eventType,
        guestCount: parseInt(customerInfo.pax),
        eventTime: customerInfo.eventTime,
      });
      
      alert('PDF generated successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + (error as Error).message);
    }
  };

  if (totalItems === 0) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-16 w-16 bg-orange-600 hover:bg-orange-700 shadow-lg"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {totalItems}
            </Badge>
          </div>
        </Button>
      </motion.div>

      {/* Cart Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] mx-4 overflow-hidden"
            >
              <Card className="h-full">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Your Butta Menu Selection
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0 overflow-y-auto max-h-[calc(90vh-200px)]">
                  {/* Category Limits Info */}
                  <div className="p-4 bg-orange-50 border-b">
                    <h3 className="font-semibold text-orange-800 mb-2">Selection Limits</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {state.categoryLimits.map(limit => {
                        const count = getCategoryCount(state, limit.categoryId);
                        const isExceeded = count > limit.limit;
                        return (
                          <div key={limit.categoryId} className={`flex justify-between ${isExceeded ? 'text-red-600' : 'text-gray-600'}`}>
                            <span>{limit.name}:</span>
                            <span className="font-medium">
                              {count}/{limit.limit} {isExceeded && '(+' + (count - limit.limit) + ' add-on)'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Base Items */}
                  {baseItems.length > 0 && (
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Base Menu Items
                        </Badge>
                      </h3>
                      <div className="space-y-3">
                        {baseItems.map((selection) => (
                          <CartItem
                            key={selection.item.id}
                            selection={selection}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeItem}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add-On Items */}
                  {addOnItems.length > 0 && (
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Add-On Items
                        </Badge>
                        <span className="text-sm text-gray-500">(Exceeds category limits)</span>
                      </h3>
                      <div className="space-y-3">
                        {addOnItems.map((selection) => (
                          <CartItem
                            key={selection.item.id}
                            selection={selection}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeItem}
                            isAddOn={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="p-4 bg-gray-50">
                    <div className="space-y-2">
                      {state.totalPrice > 0 && (
                        <div className="flex justify-between text-lg">
                          <span className="font-medium">Base Menu Total:</span>
                          <span className="font-semibold text-green-600">
                            {formatPrice(state.totalPrice)}
                          </span>
                        </div>
                      )}
                      {state.totalAddOnPrice > 0 && (
                        <div className="flex justify-between text-lg">
                          <span className="font-medium">Add-On Total:</span>
                          <span className="font-semibold text-orange-600">
                            {formatPrice(state.totalAddOnPrice)}
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Grand Total:</span>
                          <span className="text-primary">
                            {formatPrice(state.totalPrice + state.totalAddOnPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Actions */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      size="sm"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsOpen(false);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          generateSimplePDF();
                          alert('Simple PDF generated successfully!');
                        } catch (error) {
                          console.error('Simple PDF Error:', error);
                          alert('Simple PDF Error: ' + error);
                        }
                      }}
                    >
                      Test PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          generateButtaMenuPDF(state.selectedItems, {
                            name: 'Test Customer',
                            guestCount: 100,
                            eventDate: new Date().toLocaleDateString(),
                            eventType: 'Test Event'
                          });
                          alert('Butta PDF generated successfully!');
                        } catch (error) {
                          console.error('Butta PDF Error:', error);
                          alert('Butta PDF Error: ' + error);
                        }
                      }}
                    >
                      Quick PDF
                    </Button>
                    <Button
                      className="bg-orange-600 hover:bg-orange-700"
                      size="sm"
                      onClick={() => {
                        if (state.selectedItems.length === 0) {
                          alert('Please select some menu items first!');
                          return;
                        }
                        setIsOpen(false);
                        setIsCustomerInfoOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Full PDF
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <ButtaMenuPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        businessInfo={businessInfo}
      />

      {/* Customer Info Modal */}
      <CustomerInfoModal
        isOpen={isCustomerInfoOpen}
        onClose={() => setIsCustomerInfoOpen(false)}
        onSubmit={handleCustomerInfoSubmit}
      />
    </>
  );
}

interface CartItemProps {
  selection: any;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isAddOn?: boolean;
}

function CartItem({ selection, onUpdateQuantity, onRemove, isAddOn = false }: CartItemProps) {
  const { item, quantity } = selection;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${isAddOn ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex-1">
        <h4 className="font-medium text-gray-800">{item.name}</h4>
        <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
        {isAddOn && (
          <Badge variant="outline" className="mt-1 text-xs text-orange-600 border-orange-300">
            Add-On Item
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.id, quantity - 1)}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <span className="w-8 text-center font-medium">{quantity}</span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.id, quantity + 1)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {item.price > 0 && (
        <div className="text-right min-w-[80px]">
          <div className="font-semibold">
            {formatPrice(item.price * quantity)}
          </div>
          <div className="text-xs text-gray-500">
            {formatPrice(item.price)} each
          </div>
        </div>
      )}
    </div>
  );
}