import { motion, useMotionValue, useTransform } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMenuData } from "@/hooks/useMenuData";


interface MobileCategoryNavProps {
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string) => void;
}

export function MobileCategoryNav({ selectedCategoryId, onCategorySelect }: MobileCategoryNavProps) {
  const { categories, getItemsByCategory } = useMenuData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  // Move useTransform to top level to avoid conditional hook usage
  const xTransform = useTransform(x, (value) => `${value}%`);
  
  const itemsPerView = 2.5; // Show 2.5 items at a time on mobile
  const itemWidth = 100 / itemsPerView; // Percentage width per item

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (velocity > 0 || offset > 0) {
        // Swipe right - go to previous
        navigateToIndex(Math.max(0, currentIndex - 1));
      } else {
        // Swipe left - go to next
        navigateToIndex(Math.min(categories.length - itemsPerView, currentIndex + 1));
      }
    } else {
      // Snap back to current position
      x.set(-currentIndex * (100 / itemsPerView));
    }
  };

  const navigateToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(categories.length - itemsPerView, index));
    setCurrentIndex(clampedIndex);
    x.set(-clampedIndex * (100 / itemsPerView));
  };

  const goToPrevious = () => {
    navigateToIndex(currentIndex - 1);
  };

  const goToNext = () => {
    navigateToIndex(currentIndex + 1);
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-background border-b border-border py-4 md:hidden">
      <div className="flex items-center px-4">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="mr-2 flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Categories Container */}
        <div ref={constraintsRef} className="flex-1 overflow-hidden">
          <motion.div
            className="flex"
            style={{ x: xTransform }}
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            whileDrag={{ cursor: "grabbing" }}
          >
            {categories.map((category) => {
              const itemCount = getItemsByCategory(category.id).length;
              const isSelected = selectedCategoryId === category.id;
              
              return (
                <motion.div
                  key={category.id}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${itemWidth}%` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={`
                      relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                      ${isSelected 
                        ? 'border-primary bg-primary/10 shadow-md' 
                        : 'border-border bg-card hover:border-primary/50'
                      }
                    `}
                    onClick={() => onCategorySelect(category.id)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{category.icon}</div>
                      <div className="text-xs font-medium text-foreground line-clamp-1">
                        {category.name}
                      </div>
                      <Badge 
                        variant={isSelected ? "default" : "secondary"}
                        className="text-xs mt-1"
                      >
                        {itemCount}
                      </Badge>
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        layoutId="selectedIndicator"
                        className="absolute inset-0 border-2 border-primary rounded-lg"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Next Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={currentIndex >= categories.length - itemsPerView}
          className="ml-2 flex-shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Scroll Indicators */}
      <div className="flex justify-center mt-3 space-x-1">
        {Array.from({ length: Math.ceil(categories.length / itemsPerView) }).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              Math.floor(currentIndex / itemsPerView) === index
                ? 'bg-primary'
                : 'bg-muted-foreground/30'
            }`}
            onClick={() => navigateToIndex(index * itemsPerView)}
          />
        ))}
      </div>
    </div>
  );
}