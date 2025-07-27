import { motion } from "framer-motion";
import { MenuItem } from "./MenuItem";
import { useMenuData } from "@/hooks/useMenuData";

import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MenuItemGridProps {
  categoryId: string;
  onBack?: () => void;
}

export function MenuItemGrid({ categoryId, onBack }: MenuItemGridProps) {
  const { getItemsByCategory, getCategoryById } = useMenuData();
  
  const category = getCategoryById(categoryId);
  const items = getItemsByCategory(categoryId);

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Category not found.</p>
        {onBack && (
          <Button onClick={onBack} variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">{category.icon}</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No items available in {category.name}
        </h3>
        <p className="text-muted-foreground mb-6">
          Check back soon for delicious additions to this category!
        </p>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        )}
      </div>
    );
  }



  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          {onBack && (
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                {category.name}
              </h2>
              <p className="text-muted-foreground">
                {category.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Items Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {items.map((item, index) => (
          <MenuItem
            key={item.id}
            item={item}
            index={index}
          />
        ))}
      </motion.div>

      {/* Category Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center pt-8 border-t border-border"
      >
        <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>All items available for catering</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Fresh ingredients daily</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span>Customizable portions</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}