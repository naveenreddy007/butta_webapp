import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ResponsiveMenuLayout } from "./ResponsiveMenuLayout";
import { FloatingCart } from "./FloatingCart";
import { Container } from "@/components/layout";

interface MenuSectionProps {
  businessInfo: {
    name: string;
    logo: string;
    contact: {
      phone: string;
      email: string;
      address: string;
    };
    branding: {
      primaryColor: string;
      secondaryColor: string;
    };
  };
}

export function MenuSection({ businessInfo }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 0.3]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(undefined);
  };

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      {/* Parallax Background */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-yellow-950/20" />
        
        {/* Floating spice elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-16 h-16 bg-orange-200/30 rounded-full blur-xl"
        />
        
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-40 right-20 w-24 h-24 bg-red-200/30 rounded-full blur-xl"
        />
        
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-32 left-1/3 w-20 h-20 bg-yellow-200/30 rounded-full blur-xl"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <Container className="px-0 md:px-4">
          <ResponsiveMenuLayout
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            onBack={handleBackToCategories}
          />
        </Container>
      </div>

      {/* Floating Cart */}
      <FloatingCart businessInfo={businessInfo} />
    </section>
  );
}