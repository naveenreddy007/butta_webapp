import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, MapPin, Users, Star, Calendar, Phone } from "lucide-react";

interface ConventionHallHeroProps {
  businessInfo: any;
  onNavigate: (page: string) => void;
}

export function ConventionHallHero({ businessInfo, onNavigate }: ConventionHallHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background with Convention Hall Image */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-butta-primary/20 via-butta-secondary/10 to-butta-accent/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {/* Placeholder for hall image */}
        <div className="w-full h-full bg-gradient-to-br from-butta-light/30 via-white/10 to-butta-primary/20" />
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-butta-gold/20 rounded-full blur-xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-32 right-16 w-32 h-32 bg-butta-primary/20 rounded-full blur-xl"
        animate={{
          y: [0, 25, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-4 max-w-6xl mx-auto"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Location Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <Badge className="bg-butta-primary/20 text-butta-dark border-butta-primary/30 px-4 py-2 text-sm">
              <MapPin className="h-4 w-4 mr-2" />
              {businessInfo.contact.landmark}
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="butta-text-gradient block">
              {businessInfo.name}
            </span>
            <span className="text-2xl md:text-4xl lg:text-5xl text-white/90 font-normal block mt-2">
              Premium Wedding & Event Venue
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed max-w-3xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {businessInfo.tagline}
          </motion.p>

          {/* Key Features */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              Up to 1000 Guests
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              Premium Facilities
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              <Calendar className="h-4 w-4 mr-2" />
              Available 24/7
            </Badge>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg bg-butta-primary hover:bg-butta-secondary butta-shadow butta-hover"
              onClick={() => onNavigate('booking')}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book Your Event
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-lg border-white/30 text-white hover:bg-white/10 butta-hover"
              onClick={() => onNavigate('gallery')}
            >
              View Gallery
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-lg border-butta-gold/50 text-butta-gold hover:bg-butta-gold/10 butta-hover"
              onClick={() => onNavigate('catering-menu')}
            >
              Catering Menu
            </Button>
          </motion.div>

          {/* Quick Contact */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <a 
              href={`tel:${businessInfo.contact.phone}`}
              className="flex items-center gap-2 text-white/90 hover:text-butta-gold transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span className="text-lg font-medium">{businessInfo.contact.phone}</span>
            </a>
            <div className="hidden sm:block w-px h-6 bg-white/30" />
            <span className="text-white/70">Call for Instant Booking</span>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-butta-gold mb-2">1000+</div>
              <p className="text-white/70 text-sm">Events Hosted</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-butta-gold mb-2">500</div>
              <p className="text-white/70 text-sm">Indoor Seating</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-butta-gold mb-2">120</div>
              <p className="text-white/70 text-sm">Car Parking</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-butta-gold mb-2">4.9</div>
              <p className="text-white/70 text-sm">Rating</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center text-white/70"
          >
            <span className="text-sm mb-2">Explore Our Venue</span>
            <ArrowDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}