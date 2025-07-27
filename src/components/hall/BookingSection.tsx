import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Mail, Clock } from "lucide-react";

interface BookingSectionProps {
  businessInfo: any;
  onNavigate: (page: string) => void;
}

export function BookingSection({ businessInfo, onNavigate }: BookingSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-butta-primary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="bg-butta-primary/10 text-butta-dark border-butta-primary/20 mb-4">
            <Calendar className="h-4 w-4 mr-2" />
            Book Your Event
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold butta-text-gradient mb-6">
            Ready to Book Your Dream Event?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-8 butta-hover">
            <Phone className="h-12 w-12 text-butta-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Call Now</h3>
            <p className="text-gray-600 mb-4">Speak directly with our event specialists</p>
            <Button className="bg-butta-primary hover:bg-butta-secondary">
              {businessInfo.contact.phone}
            </Button>
          </Card>

          <Card className="text-center p-8 butta-hover">
            <Mail className="h-12 w-12 text-butta-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Email Us</h3>
            <p className="text-gray-600 mb-4">Get detailed information and quotes</p>
            <Button variant="outline" className="border-butta-secondary text-butta-secondary">
              {businessInfo.contact.email}
            </Button>
          </Card>

          <Card className="text-center p-8 butta-hover">
            <Clock className="h-12 w-12 text-butta-gold mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Visit Us</h3>
            <p className="text-gray-600 mb-4">Schedule a venue tour</p>
            <Button variant="outline" className="border-butta-gold text-butta-gold">
              Schedule Tour
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}