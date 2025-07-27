import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { useState } from "react";
import { ShoppingCart, X, Plus, Minus, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMenuSelection } from "@/context/MenuSelectionContext";
import { formatPrice } from "@/lib/menuValidation";
import { PDFModal } from "@/components/pdf/PDFModal";
import type { BusinessInfo } from "@/types";

interface FloatingCartProps {
  businessInfo: BusinessInfo;
}

export function FloatingCart({ businessInfo }: FloatingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const { state, updateQuantity, removeItem, clearCart } = useMenuSelection();

  const { selectedItems, totalPrice, totalItems } = state;

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Close cart if dragged right with sufficient velocity or distance
    if (velocity > 500 || offset > threshold) {
      setIsOpen(false);
    }
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Cart Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              <motion.div
                key={totalItems}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2"
              >
                <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                  {totalItems > 99 ? '99+' : totalItems}
                </Badge>
              </motion.div>
            </div>
          </Button>
        </motion.div>
      </motion.div>

      {/* Cart Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.2 }}
              onDragEnd={handleDragEnd}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 overflow-hidden touch-pan-y"
            >
              <Card className="h-full rounded-none border-0">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Your Selection
                      </CardTitle>
                      <CardDescription>
                        {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-0 touch-pan-y">
                  <div className="p-4 space-y-4">
                    {selectedItems.map((selection, index) => (
                      <motion.div
                        key={selection.item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-muted/30 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground line-clamp-1">
                              {selection.item.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {selection.item.description}
                            </p>
                            <div className="text-sm font-medium text-primary mt-1">
                              {formatPrice(selection.item.price)} each
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(selection.item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 touch-manipulation"
                              onClick={() => updateQuantity(selection.item.id, selection.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <motion.span
                              key={selection.quantity}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="text-lg font-bold text-foreground min-w-[2rem] text-center"
                            >
                              {selection.quantity}
                            </motion.span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 touch-manipulation"
                              onClick={() => updateQuantity(selection.item.id, selection.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {formatPrice(selection.item.price * selection.quantity)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>

                {/* Cart Footer */}
                <div className="border-t p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">
                      Total:
                    </span>
                    <motion.span
                      key={totalPrice}
                      initial={{ scale: 1.1, color: "#f97316" }}
                      animate={{ scale: 1, color: "inherit" }}
                      className="text-2xl font-bold text-primary"
                    >
                      {formatPrice(totalPrice)}
                    </motion.span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => setIsPDFModalOpen(true)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 touch-manipulation"
                      size="lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Menu PDF
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
                    >
                      Clear Cart
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                    PDF will include all selected items with quantities and pricing
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center mt-2 md:hidden">
                    💡 Swipe right to close cart
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PDF Modal */}
      <PDFModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        businessInfo={businessInfo}
      />
    </>
  );
}