import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Briefcase, 
  Gift, 
  Users, 
  Star,
  Check,
  ArrowRight,
  Crown,
  Sparkles
} from "lucide-react";

interface EventPackagesProps {
  packages: string[];
  pricing: any;
}

const eventPackages = [
  {
    id: "wedding",
    icon: Heart,
    title: "Wedding Package",
    subtitle: "Make your special day unforgettable",
    description: "Complete wedding solution with premium decorations, catering, and photography",
    price: "₹2,50,000",
    duration: "Full Day",
    guests: "Up to 500",
    popular: true,
    features: [
      "Bridal suite access",
      "Premium decoration",
      "Professional photography setup",
      "Sound & lighting system",
      "Valet parking service",
      "Catering coordination",
      "Event coordinator",
      "Backup power"
    ],
    color: "pink",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    id: "corporate",
    icon: Briefcase,
    title: "Corporate Package",
    subtitle: "Professional events made perfect",
    description: "Ideal for conferences, seminars, product launches, and corporate celebrations",
    price: "₹1,50,000",
    duration: "8 Hours",
    guests: "Up to 300",
    popular: false,
    features: [
      "AV equipment setup",
      "High-speed WiFi",
      "Business lunch catering",
      "Presentation screens",
      "Conference seating",
      "Tea/coffee service",
      "Parking facilities",
      "Technical support"
    ],
    color: "blue",
    gradient: "from-blue-500 to-indigo-500"
  },
  {
    id: "celebration",
    icon: Gift,
    title: "Celebration Package",
    subtitle: "Perfect for life's special moments",
    description: "Birthday parties, anniversaries, engagements, and family celebrations",
    price: "₹1,00,000",
    duration: "6 Hours",
    guests: "Up to 200",
    popular: false,
    features: [
      "Themed decorations",
      "DJ & music system",
      "Dance floor setup",
      "Catering service",
      "Photography area",
      "Party lighting",
      "Cake cutting setup",
      "Gift display area"
    ],
    color: "purple",
    gradient: "from-purple-500 to-violet-500"
  }
];

export function EventPackages({ packages, pricing }: EventPackagesProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-butta-light/30 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="bg-butta-primary/10 text-butta-dark border-butta-primary/20 mb-4">
            <Star className="h-4 w-4 mr-2" />
            Event Packages
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold butta-text-gradient mb-6">
            Tailored for Every Occasion
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose from our carefully crafted packages designed to make your event 
            seamless and memorable, or let us create a custom solution just for you.
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {eventPackages.map((pkg, index) => {
            const Icon = pkg.icon;
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 * index }}
                className="relative"
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-butta-gold text-white border-0 px-4 py-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card className={`h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 butta-hover overflow-hidden ${
                  pkg.popular ? 'ring-2 ring-butta-gold/50' : ''
                }`}>
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${pkg.gradient} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="h-8 w-8" />
                        {pkg.popular && <Sparkles className="h-6 w-6" />}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{pkg.title}</h3>
                      <p className="text-white/90 text-sm">{pkg.subtitle}</p>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-butta-dark mb-1">{pkg.price}</div>
                      <div className="text-sm text-gray-500">{pkg.duration} • {pkg.guests}</div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-butta-primary mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button 
                      className={`w-full py-3 ${
                        pkg.popular 
                          ? 'bg-butta-gold hover:bg-butta-gold/90' 
                          : 'bg-butta-primary hover:bg-butta-secondary'
                      } text-white font-semibold`}
                    >
                      Choose This Package
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Custom Package CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto border-2 border-dashed border-butta-primary/30 bg-gradient-to-r from-butta-light/50 to-white">
            <CardContent className="p-8">
              <Users className="h-12 w-12 text-butta-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-butta-dark mb-4">
                Need Something Custom?
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Every event is unique. Let our experts create a personalized package 
                that perfectly fits your vision, budget, and requirements.
              </p>
              <Button 
                size="lg" 
                variant="outline"
                className="border-butta-primary/50 text-butta-dark hover:bg-butta-primary/10"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Create Custom Package
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            * Prices may vary based on guest count, season, and additional requirements. 
            <br />Contact us for detailed quotation and availability.
          </p>
        </motion.div>
      </div>
    </section>
  );
}