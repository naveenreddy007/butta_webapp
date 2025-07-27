import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart, Info, Check } from "lucide-react";
import type { MenuItem as MenuItemType } from "@/types";
import { formatPrice, getDietaryRestrictionLabel, getDietaryRestrictionColor } from "@/lib/menuValidation";
import { useMenuSelection } from "@/context/MenuSelectionContext";

interface MenuItemProps {
  item: MenuItemType;
  index?: number;
}

export function MenuItem({ item, index = 0 }: MenuItemProps) {
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl">
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 h-48">
          {item.image ? (
            <motion.img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: isHovered ? 1.1 : 1,
                  rotate: isHovered ? [0, -5, 5, 0] : 0
                }}
                transition={{ duration: 0.5 }}
                className="text-6xl opacity-50"
              >
                🍽️
              </motion.div>
            </div>
          )}
          
          {/* Price Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: (index * 0.1) + 0.3, duration: 0.3 }}
            className="absolute top-3 right-3"
          >
            <Badge className="bg-primary text-primary-foreground font-bold text-lg px-3 py-1">
              {formatPrice(item.price)}
            </Badge>
          </motion.div>

          {/* Dietary Restrictions */}
          {item.dietaryRestrictions && item.dietaryRestrictions.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
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
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-foreground line-clamp-1">
            {item.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Special Notes */}
          {item.specialNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: showDetails ? 1 : 0.7, 
                height: "auto" 
              }}
              className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2"
            >
              <Info className="h-3 w-3 inline mr-1" />
              {item.specialNotes}
            </motion.div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-foreground">Quantity:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
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
                  className="h-8 w-8 p-0"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total</div>
              <motion.div
                key={quantity}
                initial={{ scale: 1.1, color: "#f97316" }}
                animate={{ scale: 1, color: "inherit" }}
                className="text-lg font-bold text-primary"
              >
                {formatPrice(item.price * quantity)}
              </motion.div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleAddToCart}
              className={`w-full font-semibold py-2 transition-all duration-300 ${
                justAdded 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
              size="lg"
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </motion.div>

          {/* Cart Status */}
          {currentCartQuantity > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {currentCartQuantity} in cart
              </Badge>
            </motion.div>
          )}

          {/* Details Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>

          {/* Extended Details */}
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
              <div className="space-y-2 pt-2 border-t border-border">
                {item.dietaryRestrictions && item.dietaryRestrictions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1">
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
                
                <div className="text-xs text-muted-foreground">
                  <strong>Item ID:</strong> {item.id}
                </div>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}