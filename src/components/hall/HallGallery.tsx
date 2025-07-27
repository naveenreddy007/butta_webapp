import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Maximize2, Users, Square } from "lucide-react";

const galleryImages = [
  {
    id: 1,
    title: "Main Banquet Hall",
    description: "Spacious air-conditioned hall with modern lighting",
    capacity: "500 guests",
    area: "8000 sq ft",
    image: "/images/hall-main.jpg",
    category: "indoor"
  },
  {
    id: 2,
    title: "Outdoor Lawn Area",
    description: "Beautiful garden setting for outdoor ceremonies",
    capacity: "1000 guests",
    area: "12000 sq ft", 
    image: "/images/hall-lawn.jpg",
    category: "outdoor"
  },
  {
    id: 3,
    title: "Bridal Suite",
    description: "Luxurious AC rooms for bride preparation",
    capacity: "10 people",
    area: "400 sq ft",
    image: "/images/bridal-suite.jpg",
    category: "rooms"
  },
  {
    id: 4,
    title: "Reception Area",
    description: "Elegant entrance and welcome area",
    capacity: "200 guests",
    area: "2000 sq ft",
    image: "/images/reception.jpg",
    category: "indoor"
  },
  {
    id: 5,
    title: "Dining Hall",
    description: "Separate dining area with catering facilities",
    capacity: "300 guests",
    area: "4000 sq ft",
    image: "/images/dining.jpg",
    category: "indoor"
  },
  {
    id: 6,
    title: "Parking Area",
    description: "Spacious parking for cars and two-wheelers",
    capacity: "120 cars",
    area: "15000 sq ft",
    image: "/images/parking.jpg",
    category: "facilities"
  }
];

const categories = [
  { id: "all", name: "All Spaces", icon: Square },
  { id: "indoor", name: "Indoor Halls", icon: Square },
  { id: "outdoor", name: "Outdoor Areas", icon: Square },
  { id: "rooms", name: "Bridal Suites", icon: Square },
  { id: "facilities", name: "Facilities", icon: Square }
];

export function HallGallery() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredImages = selectedCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-butta-light/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="bg-butta-primary/10 text-butta-dark border-butta-primary/20 mb-4">
            <Eye className="h-4 w-4 mr-2" />
            Venue Gallery
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold butta-text-gradient mb-6">
            Explore Our Premium Spaces
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Take a virtual tour of our beautifully designed convention hall, outdoor spaces, 
            and premium facilities that make every event memorable.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-butta-primary hover:bg-butta-secondary text-white butta-shadow"
                    : "border-butta-primary/30 text-butta-dark hover:bg-butta-primary/10"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="group"
            >
              <Card className="overflow-hidden butta-hover cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* Placeholder for image */}
                  <div className="w-full h-full bg-gradient-to-br from-butta-light via-butta-primary/20 to-butta-secondary/30 flex items-center justify-center">
                    <div className="text-center text-butta-dark/60">
                      <Square className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm font-medium">{image.title}</p>
                    </div>
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* View Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                      onClick={() => setSelectedImage(image.id)}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-butta-primary/90 text-white border-0 capitalize">
                      {image.category}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-butta-dark mb-2">
                    {image.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {image.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-butta-secondary">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="font-medium">{image.capacity}</span>
                    </div>
                    <div className="text-gray-500">
                      <span>{image.area}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 py-4 border-butta-primary/30 text-butta-dark hover:bg-butta-primary/10 butta-hover"
          >
            <Eye className="h-5 w-5 mr-2" />
            Schedule a Virtual Tour
          </Button>
        </motion.div>
      </div>
    </section>
  );
}