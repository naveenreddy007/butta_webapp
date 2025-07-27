import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Car, 
  Bed, 
  Wifi, 
  Zap, 
  Music, 
  Utensils, 
  Shield,
  Snowflake,
  Camera,
  Lightbulb,
  MapPin
} from "lucide-react";

interface VenueFeaturesProps {
  venue: any;
  services: string[];
}

const features = [
  {
    icon: Users,
    title: "Flexible Capacity",
    description: "Indoor seating for 400-500 guests, floating capacity up to 1000",
    highlight: "Up to 1000 guests",
    color: "butta-primary"
  },
  {
    icon: Car,
    title: "Ample Parking",
    description: "Dedicated parking space for 120 cars and 200 two-wheelers",
    highlight: "120 cars + 200 bikes",
    color: "butta-secondary"
  },
  {
    icon: Bed,
    title: "Bridal Suites",
    description: "2 luxurious AC bridal suites for preparation and relaxation",
    highlight: "2 AC suites",
    color: "butta-gold"
  },
  {
    icon: Snowflake,
    title: "Climate Control",
    description: "Full air conditioning throughout the indoor hall areas",
    highlight: "Central AC",
    color: "blue-500"
  },
  {
    icon: Zap,
    title: "Power Backup",
    description: "Uninterrupted power supply with backup generators",
    highlight: "24/7 power",
    color: "yellow-500"
  },
  {
    icon: Music,
    title: "Sound System",
    description: "Professional audio system with wireless microphones",
    highlight: "Premium audio",
    color: "purple-500"
  },
  {
    icon: Lightbulb,
    title: "Custom Lighting",
    description: "Adjustable LED lighting for different event moods",
    highlight: "LED lighting",
    color: "orange-500"
  },
  {
    icon: Utensils,
    title: "Catering Facilities",
    description: "In-house catering or bring your own caterer options",
    highlight: "Flexible catering",
    color: "green-500"
  },
  {
    icon: Shield,
    title: "Security",
    description: "24/7 security with CCTV surveillance and valet parking",
    highlight: "Full security",
    color: "red-500"
  },
  {
    icon: Wifi,
    title: "High-Speed WiFi",
    description: "Complimentary high-speed internet for all guests",
    highlight: "Free WiFi",
    color: "indigo-500"
  },
  {
    icon: Camera,
    title: "Photography Friendly",
    description: "Perfect lighting and backdrops for memorable photos",
    highlight: "Photo ready",
    color: "pink-500"
  },
  {
    icon: MapPin,
    title: "Prime Location",
    description: "Central Hyderabad location opposite Cyber Towers",
    highlight: "IT corridor",
    color: "teal-500"
  }
];

export function VenueFeatures({ venue, services }: VenueFeaturesProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="bg-butta-primary/10 text-butta-dark border-butta-primary/20 mb-4">
            <Shield className="h-4 w-4 mr-2" />
            Premium Facilities
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold butta-text-gradient mb-6">
            World-Class Amenities
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every detail has been carefully designed to ensure your event is flawless. 
            From state-of-the-art facilities to personalized services.
          </p>
        </motion.div>

        {/* Venue Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          <div className="text-center p-6 bg-gradient-to-br from-butta-light to-white rounded-2xl butta-shadow">
            <div className="text-3xl md:text-4xl font-bold text-butta-primary mb-2">500</div>
            <p className="text-gray-600 font-medium">Indoor Seating</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-butta-light to-white rounded-2xl butta-shadow">
            <div className="text-3xl md:text-4xl font-bold text-butta-secondary mb-2">1000</div>
            <p className="text-gray-600 font-medium">Max Capacity</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-butta-light to-white rounded-2xl butta-shadow">
            <div className="text-3xl md:text-4xl font-bold text-butta-gold mb-2">8000</div>
            <p className="text-gray-600 font-medium">Sq Ft Area</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-butta-light to-white rounded-2xl butta-shadow">
            <div className="text-3xl md:text-4xl font-bold text-butta-accent mb-2">24/7</div>
            <p className="text-gray-600 font-medium">Available</p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-500 butta-hover group">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${feature.color}/10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-8 w-8 text-${feature.color}`} />
                    </div>
                    
                    <h3 className="text-lg font-bold text-butta-dark mb-2">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <Badge 
                      variant="secondary" 
                      className={`bg-${feature.color}/10 text-${feature.color} border-${feature.color}/20`}
                    >
                      {feature.highlight}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-butta-dark mb-6">Additional Services</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {services.map((service, index) => (
              <motion.div
                key={service}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.9 + (0.1 * index) }}
              >
                <Badge 
                  variant="outline" 
                  className="px-4 py-2 text-sm border-butta-primary/30 text-butta-dark hover:bg-butta-primary/10 transition-colors cursor-default"
                >
                  {service}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}