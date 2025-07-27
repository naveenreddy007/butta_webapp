import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart, Check, Info } from "lucide-react";
import type { MenuItem as MenuItemType } from "@/types";
import { formatPrice, getDietaryRestrictionLabel, getDietaryRestrictionColor } from "@/lib/menuValidation";
import { useMenuSelection } from "@/context/MenuSelectionContext";
import { useTouchInteractions } from "@/hooks/useTouchInteractions";

interface MobileMenuItemProps {
  item: MenuItemType;
  index?: number;
}

export function MobileMenuItem({ item, index = 0 }: MobileMenuItemProps) {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const { addItem, getItemQuantity } = useMenuSelection();
  const currentCartQuantity = getItemQuantity(item.id);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    addItem(item, quantity);
    setJustAdded(true);
    setQuantity(1);
    
    // Reset the "just added" state after animation
    setTimeout(() => setJustAdded(false), 2000);
  };

  useTouchInteractions({
    onTap: () => setShowDetails(!showDetails),
    onLongPress: () => {
      // Quick add to cart on long press
      addItem(item, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="w-full"
    >
      <Card className="overflow-hidden bg-card border border-border shadow-sm">
        {/* Main Content */}
        <div className="flex p-4 space-x-4">
          {/* Image/Icon */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-3xl opacity-60">🍽️</div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                {item.name}
              </h3>
              <Badge className="bg-primary text-primary-foreground font-bold text-sm ml-2">
                {formatPrice(item.price)}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {item.description}
            </p>

            {/* Dietary Restrictions */}
            {item.dietaryRestrictions && item.dietaryRestrictions.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.dietaryRestrictions.slice(0, 2).map((restriction) => (
                  <Badge
                    key={restriction}
                    variant="secondary"
                    className={`text-xs ${getDietaryRestrictionColor(restriction)}`}
                  >
                    {getDietaryRestrictionLabel(restriction)}
                  </Badge>
                ))}
                {item.dietaryRestrictions.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{item.dietaryRestrictions.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 touch-manipulation"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <motion.span
                  key={quantity}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-foreground min-w-[2rem] text-center"
                >
                  {quantity}
                </motion.span>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 touch-manipulation"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                size="sm"
                className={`touch-manipulation transition-all duration-300 ${
                  justAdded 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>

            {/* Cart Status */}
            {currentCartQuantity > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2"
              >
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                  {currentCartQuantity} in cart
                </Badge>
              </motion.div>
            )}
          </div>
        </div>

        {/* Expandable Details */}
        <motion.div
          initial={false}
          animate={{
            height: showDetails ? "auto" : 0,
            opacity: showDetails ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {showDetails && (
            <CardContent className="pt-0 pb-4 border-t border-border">
              {item.specialNotes && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-3 w-3 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Special Notes:</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">
                    {item.specialNotes}
                  </p>
                </div>
              )}

              {item.dietaryRestrictions && item.dietaryRestrictions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-2">
                    Dietary Information:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {item.dietaryRestrictions.map((restriction) => (
                      <Badge
                        key={restriction}
                        variant="outline"
                        className={`text-xs ${getDietaryRestrictionColor(restriction)}`}
                      >
                        {getDietaryRestrictionLabel(restriction)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </motion.div>

        {/* Touch interaction hint */}
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground text-center">
            Tap for details • Long press to quick add
          </p>
        </div>
      </Card>
    </motion.div>
  );
}