import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya & Rajesh",
    event: "Wedding Reception",
    rating: 5,
    text: "Butta Convention made our dream wedding come true! The staff was incredibly professional and the venue was absolutely stunning.",
    image: "/testimonials/couple1.jpg"
  },
  {
    name: "Tech Solutions Inc.",
    event: "Corporate Event",
    rating: 5,
    text: "Perfect venue for our annual conference. Excellent facilities, great catering, and seamless event management.",
    image: "/testimonials/corporate1.jpg"
  },
  {
    name: "Anitha Family",
    event: "Birthday Celebration",
    rating: 5,
    text: "Amazing experience! The team went above and beyond to make our celebration special. Highly recommended!",
    image: "/testimonials/family1.jpg"
  }
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="bg-butta-primary/10 text-butta-dark border-butta-primary/20 mb-4">
            <Star className="h-4 w-4 mr-2" />
            Happy Clients
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold butta-text-gradient mb-6">
            What Our Clients Say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 * index }}
            >
              <Card className="h-full p-6 butta-hover">
                <CardContent className="p-0">
                  <Quote className="h-8 w-8 text-butta-primary mb-4" />
                  <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-butta-dark">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.event}</p>
                    </div>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-butta-gold fill-current" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}