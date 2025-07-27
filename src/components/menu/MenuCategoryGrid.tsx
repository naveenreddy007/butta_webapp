import { motion } from "framer-motion";
import { MenuCategory } from "./MenuCategory";
import { useMenuData } from "@/hooks/useMenuData";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MenuCategoryGridProps {
  onCategorySelect?: (categoryId: string) => void;
  selectedCategoryId?: string;
}

export function MenuCategoryGrid({ 
  onCategorySelect, 
  selectedCategoryId 
}: MenuCategoryGridProps) {
  const { categories, loading, error, getItemsByCategory, refreshData } = useMenuData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading menu categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Categories
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshData} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No menu categories available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Our Menu Categories
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Explore our authentic South Indian and Hyderabadi cuisine. 
          Click on any category to view the delicious items we offer.
        </p>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {categories.map((category, index) => {
          const itemCount = getItemsByCategory(category.id).length;
          const isSelected = selectedCategoryId === category.id;
          
          return (
            <MenuCategory
              key={category.id}
              category={category}
              itemCount={itemCount}
              isSelected={isSelected}
              onClick={() => onCategorySelect?.(category.id)}
              index={index}
            />
          );
        })}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center pt-8"
      >
        <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>{categories.length} Categories</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span>Fresh & Authentic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>Made to Order</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}