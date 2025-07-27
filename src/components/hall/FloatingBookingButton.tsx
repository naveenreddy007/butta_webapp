import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Utensils, Phone, X } from "lucide-react";

interface FloatingBookingButtonProps {
  onBookNow: () => void;
  onViewMenu: () => void;
}

export function FloatingBookingButton({ onBookNow, onViewMenu }: FloatingBookingButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Menu */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: isExpanded ? 1 : 0, 
          scale: isExpanded ? 1 : 0,
          y: isExpanded ? 0 : 20
        }}
        transition={{ duration: 0.2 }}
        className="mb-4 space-y-3"
      >
        <Button
          onClick={onBookNow}
          className="w-full bg-butta-primary hover:bg-butta-secondary text-white shadow-lg butta-hover flex items-center justify-start px-4 py-3"
        >
          <Calendar className="h-5 w-5 mr-3" />
          Book Event
        </Button>
        
        <Button
          onClick={onViewMenu}
          variant="outline"
          className="w-full border-butta-gold text-butta-gold hover:bg-butta-gold/10 shadow-lg butta-hover flex items-center justify-start px-4 py-3"
        >
          <Utensils className="h-5 w-5 mr-3" />
          View Menu
        </Button>
        
        <Button
          onClick={() => window.open('tel:+918801886108')}
          variant="outline"
          className="w-full border-butta-secondary text-butta-secondary hover:bg-butta-secondary/10 shadow-lg butta-hover flex items-center justify-start px-4 py-3"
        >
          <Phone className="h-5 w-5 mr-3" />
          Call Now
        </Button>
      </motion.div>

      {/* Main Toggle Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 ${
            isExpanded 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-butta-primary hover:bg-butta-secondary butta-gradient'
          }`}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Calendar className="h-6 w-6 text-white" />
            )}
          </motion.div>
        </Button>
      </motion.div>

      {/* Pulse Animation for Main Button */}
      {!isExpanded && (
        <motion.div
          className="absolute inset-0 rounded-full bg-butta-primary/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
}