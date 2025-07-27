import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";

interface ContactSectionProps {
  contact: any;
  venue: any;
}

export function ContactSection({ contact, venue }: ContactSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-butta-light/30 to-butta-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="bg-butta-primary/10 text-butta-dark border-butta-primary/20 mb-4">
            <MapPin className="h-4 w-4 mr-2" />
            Get In Touch
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold butta-text-gradient mb-6">
            Visit Our Premium Venue
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="p-6 butta-hover">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-butta-primary mt-1" />
                <div>
                  <h3 className="font-bold text-butta-dark mb-2">Location</h3>
                  <p className="text-gray-600">{contact.address}</p>
                  <p className="text-sm text-butta-secondary">{contact.landmark}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 butta-hover">
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-butta-secondary mt-1" />
                <div>
                  <h3 className="font-bold text-butta-dark mb-2">Phone</h3>
                  <p className="text-gray-600">{contact.phone}</p>
                  <p className="text-sm text-butta-secondary">Available 24/7</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 butta-hover">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-butta-gold mt-1" />
                <div>
                  <h3 className="font-bold text-butta-dark mb-2">Email</h3>
                  <p className="text-gray-600">{contact.email}</p>
                  <p className="text-sm text-butta-secondary">Quick response guaranteed</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 butta-hover">
              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-butta-accent mt-1" />
                <div>
                  <h3 className="font-bold text-butta-dark mb-2">Visiting Hours</h3>
                  <p className="text-gray-600">Mon - Sun: 9:00 AM - 8:00 PM</p>
                  <p className="text-sm text-butta-secondary">Or by appointment</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full min-h-[400px] overflow-hidden">
              <div className="h-full bg-gradient-to-br from-butta-light via-butta-primary/20 to-butta-secondary/30 flex items-center justify-center relative">
                <div className="text-center text-butta-dark/60">
                  <Navigation className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Interactive Map</h3>
                  <p className="text-sm">Madhapur, Hyderabad</p>
                  <p className="text-xs mt-2">Opposite Cyber Towers, KPHB Road</p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-butta-gold/20 rounded-full" />
                <div className="absolute bottom-6 left-6 w-8 h-8 bg-butta-primary/30 rounded-full" />
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}