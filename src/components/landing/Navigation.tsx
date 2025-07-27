import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import type { NavigationProps } from '../../types/landing';
import { buttaBusinessInfo } from '../../data/businessInfo';
import { cn } from '../../lib/utils';

const Navigation: React.FC<NavigationProps> = ({ activeSection, onSectionClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: '🏠 Home' },
    { id: 'venue', label: '🏛️ Venue' },
    { id: 'gallery', label: '🖼️ Gallery' },
    { id: 'packages', label: '📦 Packages' },
    { id: 'testimonials', label: '🧾 Testimonials' },
    { id: 'contact', label: '📞 Contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    onSectionClick(sectionId);
    setIsMobileMenuOpen(false);
  };

  const handleCallClick = () => {
    window.open(`tel:${buttaBusinessInfo.contact.phone}`, '_self');
  };

  const handleBookNowClick = () => {
    onSectionClick('contact');
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={buttaBusinessInfo.logo} 
                alt={buttaBusinessInfo.name}
                className="h-8 lg:h-10 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className={cn(
                  'font-serif font-bold text-lg lg:text-xl',
                  isScrolled ? 'text-gray-900' : 'text-white'
                )}>
                  {buttaBusinessInfo.name}
                </h1>
                <p className={cn(
                  'text-xs lg:text-sm',
                  isScrolled ? 'text-gray-600' : 'text-white/80'
                )}>
                  {buttaBusinessInfo.tagline}
                </p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'text-sm font-medium transition-colors duration-200 hover:scale-105',
                    activeSection === item.id
                      ? isScrolled 
                        ? 'text-green-600 border-b-2 border-green-600' 
                        : 'text-amber-400 border-b-2 border-amber-400'
                      : isScrolled
                        ? 'text-gray-700 hover:text-green-600'
                        : 'text-white/90 hover:text-amber-400'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCallClick}
                className={cn(
                  'border-2 transition-all duration-200',
                  isScrolled
                    ? 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                    : 'border-white text-white hover:bg-white hover:text-gray-900'
                )}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Us
              </Button>
              <Button
                onClick={handleBookNowClick}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6"
              >
                📅 Book Now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'lg:hidden',
                isScrolled ? 'text-gray-900' : 'text-white'
              )}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={buttaBusinessInfo.logo} 
                      alt={buttaBusinessInfo.name}
                      className="h-8 w-auto"
                    />
                    <div>
                      <h2 className="font-serif font-bold text-lg text-gray-900">
                        {buttaBusinessInfo.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {buttaBusinessInfo.tagline}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 px-6 py-8">
                  <div className="space-y-6">
                    {navigationItems.map((item, index) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleNavClick(item.id)}
                        className={cn(
                          'block w-full text-left text-lg font-medium py-3 px-4 rounded-lg transition-colors',
                          activeSection === item.id
                            ? 'bg-green-50 text-green-600 border-l-4 border-green-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                        )}
                      >
                        {item.label}
                      </motion.button>
                    ))}
                  </div>
                </nav>

                {/* Mobile Contact Info */}
                <div className="p-6 border-t bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{buttaBusinessInfo.contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{buttaBusinessInfo.contact.landmark}</span>
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleCallClick}
                        className="flex-1"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        onClick={handleBookNowClick}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        📅 Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;