import React from 'react';
import { motion } from 'framer-motion';
import { Heart, PartyPopper, Briefcase, Music, GraduationCap, Church, Calendar, Users } from 'lucide-react';
import SectionWrapper from '../shared/SectionWrapper';

interface EventType {
  icon: React.ReactNode;
  name: string;
  description: string;
  features: string[];
  color: string;
}

const EventTypes: React.FC = () => {
  const eventTypes: EventType[] = [
    {
      icon: <Heart className="w-8 h-8" />,
      name: 'Weddings',
      description: 'Traditional and modern wedding ceremonies with complete arrangements',
      features: ['Mandap Setup', 'Floral Decorations', 'Photography Areas', 'Bridal Suites'],
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: <PartyPopper className="w-8 h-8" />,
      name: 'Receptions',
      description: 'Elegant reception parties with dining and entertainment spaces',
      features: ['Stage Setup', 'Dance Floor', 'Buffet Arrangements', 'Lighting'],
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      name: 'Corporate Events',
      description: 'Professional corporate gatherings and business conferences',
      features: ['AV Equipment', 'Presentation Setup', 'Networking Areas', 'Catering'],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: <Music className="w-8 h-8" />,
      name: 'Cultural Programs',
      description: 'Traditional cultural events and artistic performances',
      features: ['Stage Lighting', 'Sound System', 'Seating Arrangements', 'Green Rooms'],
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      name: 'College Events',
      description: 'Student gatherings, graduations, and academic celebrations',
      features: ['Flexible Seating', 'Entertainment Setup', 'Food Counters', 'Photo Booths'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: <Church className="w-8 h-8" />,
      name: 'Religious Gatherings',
      description: 'Sacred ceremonies and spiritual celebrations',
      features: ['Prayer Areas', 'Traditional Setup', 'Community Seating', 'Prasadam Service'],
      color: 'from-amber-500 to-yellow-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <SectionWrapper id="packages" background="gray" padding="xl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
            Event Types We Host
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-amber-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            From intimate gatherings to grand celebrations, we cater to all types of events with personalized service and attention to detail
          </p>
        </motion.div>

        {/* Event Types Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {eventTypes.map((event, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
              whileHover={{ y: -10 }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Icon */}
              <div className={`w-20 h-20 bg-gradient-to-br ${event.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">
                  {event.icon}
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors">
                  {event.name}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {event.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {event.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-8 lg:p-12 text-white">
            <div className="flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 mr-3" />
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold mb-4">
              Planning Your Event?
            </h3>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Let us help you create unforgettable memories. Our experienced team will work with you to customize every detail of your special occasion.
            </p>
            <motion.button
              className="bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Get Started Today
            </motion.button>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

export default EventTypes;