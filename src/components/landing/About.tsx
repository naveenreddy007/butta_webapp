import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building, Users, Car, Utensils, Star, Award, Clock } from 'lucide-react';
import type { AboutProps } from '../../types/landing';
import SectionWrapper from '../shared/SectionWrapper';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const iconMap = {
  MapPin,
  Building,
  Users,
  Car,
  Utensils,
  Star,
  Award,
  Clock
};

const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ 
  end, 
  duration = 2000, 
  suffix = '' 
}) => {
  const [count, setCount] = useState(0);
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });

  useEffect(() => {
    if (!isIntersecting) return;

    let startTime: number;
    const startCount = 0;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * (end - startCount) + startCount));
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isIntersecting, end, duration]);

  return (
    <span ref={ref} className="font-bold text-green-600">
      {count}{suffix}
    </span>
  );
};

const About: React.FC<AboutProps> = ({ description, highlights, venueDetails }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <SectionWrapper id="about" background="gradient" padding="xl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
            About Butta Convention
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-amber-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Highlights Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {highlights.map((highlight, index) => {
            const IconComponent = iconMap[highlight.icon as keyof typeof iconMap] || Star;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                whileHover={{ y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-amber-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors">
                    {highlight.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">
              Why Choose Butta Convention?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Numbers that speak for our excellence and commitment to making your events memorable
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">
                <AnimatedCounter end={1000} suffix="+" />
              </div>
              <p className="text-gray-600 font-medium">Guest Capacity</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">
                <AnimatedCounter end={120} suffix="+" />
              </div>
              <p className="text-gray-600 font-medium">Car Parking</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">
                <AnimatedCounter end={2} />
              </div>
              <p className="text-gray-600 font-medium">Luxury Suites</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">
                <AnimatedCounter end={500} suffix="+" />
              </div>
              <p className="text-gray-600 font-medium">Events Hosted</p>
            </div>
          </div>
        </motion.div>

        {/* Venue Details Table */}
        {venueDetails && (
          <motion.div 
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
              <h3 className="text-3xl font-serif font-bold text-white mb-2">
                Venue Specifications
              </h3>
              <p className="text-green-100">
                Complete details about our facilities and amenities
              </p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {venueDetails.map((detail, index) => {
                  const IconComponent = iconMap[detail.icon as keyof typeof iconMap] || Building;
                  
                  return (
                    <motion.div
                      key={index}
                      className="flex items-center p-6 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <IconComponent className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{detail.feature}</h4>
                        <p className="text-gray-600">{detail.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default About;