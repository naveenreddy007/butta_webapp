import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MenuCategory as MenuCategoryType } from "@/types";

interface MenuCategoryProps {
  category: MenuCategoryType;
  itemCount: number;
  isSelected?: boolean;
  onClick?: () => void;
  index?: number;
}

export function MenuCategory({ 
  category, 
  itemCount, 
  isSelected = false, 
  onClick,
  index = 0 
}: MenuCategoryProps) {
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
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
          isSelected 
            ? 'ring-2 ring-primary shadow-lg bg-primary/5' 
            : 'hover:shadow-md'
        }`}
        onClick={onClick}
      >
        <CardHeader className="text-center pb-3">
          <motion.div
            className="text-4xl mb-3"
            whileHover={{ 
              scale: 1.2,
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.5 }
            }}
          >
            {category.icon}
          </motion.div>
          
          <CardTitle className="text-xl font-bold text-foreground">
            {category.name}
          </CardTitle>
          
          <CardDescription className="text-sm text-muted-foreground">
            {category.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center pt-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (index * 0.1) + 0.3, duration: 0.3 }}
          >
            <Badge 
              variant={isSelected ? "default" : "secondary"}
              className="text-sm font-medium"
            >
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Badge>
          </motion.div>
          
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-3 pt-3 border-t border-border"
            >
              <p className="text-xs text-primary font-medium">
                ✓ Selected Category
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}