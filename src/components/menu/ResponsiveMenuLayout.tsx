import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuCategoryGrid } from "./MenuCategoryGrid";

import { MobileCategoryNav } from "./MobileCategoryNav";
import { MobileMenuItem } from "./MobileMenuItem";
import { MenuItem } from "./MenuItem";
import { useMenuData } from "@/hooks/useMenuData";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResponsiveMenuLayoutProps {
  selectedCategory?: string;
  onCategorySelect: (categoryId: string) => void;
  onBack?: () => void;
}

export function ResponsiveMenuLayout({ 
  selectedCategory, 
  onCategorySelect, 
  onBack 
}: ResponsiveMenuLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { getItemsByCategory, getCategoryById } = useMenuData();

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const category = selectedCategory ? getCategoryById(selectedCategory) : null;
  const items = selectedCategory ? getItemsByCategory(selectedCategory) : [];

  if (!selectedCategory) {
    return (
      <>
        {/* Mobile Category Navigation */}
        {isMobile && (
          <MobileCategoryNav
            selectedCategoryId={selectedCategory}
            onCategorySelect={onCategorySelect}
          />
        )}
        
        {/* Desktop Category Grid */}
        <div className={isMobile ? "hidden" : "block"}>
          <MenuCategoryGrid
            onCategorySelect={onCategorySelect}
            selectedCategoryId={selectedCategory}
          />
        </div>

        {/* Mobile Category Grid - Simplified */}
        {isMobile && (
          <div className="p-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Choose a Category
              </h2>
              <p className="text-muted-foreground">
                Swipe through categories above or scroll down to see all
              </p>
            </div>
            <MenuCategoryGrid
              onCategorySelect={onCategorySelect}
              selectedCategoryId={selectedCategory}
            />
          </div>
        )}
      </>
    );
  }

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

  return (
    <div>
      {/* Mobile Category Navigation - Always visible when category is selected */}
      {isMobile && (
        <MobileCategoryNav
          selectedCategoryId={selectedCategory}
          onCategorySelect={onCategorySelect}
        />
      )}

      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-6 px-4"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          {onBack && !isMobile && (
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {category.name}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                {category.description}
              </p>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-sm">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </motion.div>

      {/* Items Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="px-4"
        >
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No items available in {category.name}
              </h3>
              <p className="text-muted-foreground mb-6">
                Check back soon for delicious additions to this category!
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Layout */}
              {isMobile ? (
                <div className="space-y-4 pb-20">
                  {items.map((item, index) => (
                    <MobileMenuItem
                      key={item.id}
                      item={item}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                /* Desktop Layout */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                  {items.map((item, index) => (
                    <MenuItem
                      key={item.id}
                      item={item}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Mobile Back Button - Floating */}
      {isMobile && onBack && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-20 left-4 z-40"
        >
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="bg-background/95 backdrop-blur-sm shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Categories
          </Button>
        </motion.div>
      )}
    </div>
  );
}