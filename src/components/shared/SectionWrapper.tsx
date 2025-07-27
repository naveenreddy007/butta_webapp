import React from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { cn } from '../../lib/utils';

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  background?: 'white' | 'gray' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  animationDelay?: number;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  id,
  className,
  background = 'white',
  padding = 'lg',
  animate = true,
  animationDelay = 0
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-green-50 via-white to-amber-50'
  };

  const paddingClasses = {
    sm: 'py-12 lg:py-16',
    md: 'py-16 lg:py-20',
    lg: 'py-20 lg:py-24',
    xl: 'py-24 lg:py-32'
  };

  const animationVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  const transition = {
    duration: 0.6,
    delay: animationDelay
  };

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        backgroundClasses[background],
        paddingClasses[padding],
        'relative overflow-hidden',
        className
      )}
    >
      <div className="container mx-auto px-4">
        {animate ? (
          <motion.div
            initial="hidden"
            animate={isIntersecting ? "visible" : "hidden"}
            variants={animationVariants}
            transition={transition}
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
      </div>
    </section>
  );
};

export default SectionWrapper;