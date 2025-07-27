import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Phone, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import type { HeroProps } from '../../types/landing';
import { cn } from '../../lib/utils';
import { addTouchSupport } from '../../lib/mobile';

const Hero: React.FC<HeroProps> = ({ backgroundMedia, heading, subheading, ctaButtons }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  const currentMedia = backgroundMedia[currentMediaIndex];

  // Add touch support for media navigation
  useEffect(() => {
    if (!heroRef.current || backgroundMedia.length <= 1) return;

    const cleanup = addTouchSupport(heroRef.current, {
      onSwipeLeft: handleNextMedia,
      onSwipeRight: handlePrevMedia
    });

    return cleanup;
  }, [backgroundMedia.length]);

  // Auto-rotate background media every 8 seconds for images
  useEffect(() => {
    if (backgroundMedia.length <= 1) return;

    const interval = setInterval(() => {
      if (currentMedia?.type === 'image') {
        setCurrentMediaIndex((prev) => (prev + 1) % backgroundMedia.length);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [backgroundMedia.length, currentMedia?.type]);

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + backgroundMedia.length) % backgroundMedia.length);
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % backgroundMedia.length);
  };

  const handleVideoToggle = () => {
    if (videoRef) {
      if (isVideoPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleCTAClick = (button: typeof ctaButtons[0]) => {
    switch (button.action) {
      case 'phone':
        window.open(`tel:${button.target}`, '_self');
        break;
      case 'whatsapp':
        const message = "Hi! I'm interested in booking Butta Convention for my event. Please provide more details.";
        const whatsappUrl = `https://wa.me/${button.target.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'scroll':
        const element = document.getElementById(button.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      case 'form':
        const formElement = document.getElementById('contact');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
        break;
    }
  };

  const getButtonIcon = (action: string) => {
    switch (action) {
      case 'phone':
        return <Phone className="w-4 h-4 mr-2" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  const getButtonVariant = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'secondary';
      case 'outline':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Media Container */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {currentMedia && (
            <motion.div
              key={currentMediaIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {currentMedia.type === 'image' ? (
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${currentMedia.src})` }}
                />
              ) : (
                <video
                  ref={setVideoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={currentMedia.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        
        {/* Parallax Pattern Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 via-transparent to-amber-900/10" />
      </div>

      {/* Media Controls */}
      {backgroundMedia.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMedia}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMedia}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-white/20"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Video Controls */}
      {currentMedia?.type === 'video' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleVideoToggle}
          className="absolute bottom-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white border-white/20"
        >
          {isVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
      )}

      {/* Media Indicators */}
      {backgroundMedia.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {backgroundMedia.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentMediaIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentMediaIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold mb-6 text-white leading-tight">
            {heading}
          </h1>
          
          {subheading && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-lg sm:text-xl lg:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed"
            >
              {subheading}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {ctaButtons.map((button, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleCTAClick(button)}
                  variant={getButtonVariant(button.variant)}
                  size="lg"
                  className={cn(
                    "px-8 py-4 text-lg font-semibold transition-all duration-300 min-w-[180px]",
                    button.variant === 'primary' && "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl",
                    button.variant === 'secondary' && "bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20",
                    button.variant === 'outline' && "border-2 border-white text-white hover:bg-white hover:text-gray-900"
                  )}
                >
                  {getButtonIcon(button.action)}
                  {button.text}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center text-white/70"
            >
              <span className="text-sm mb-2">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1 h-3 bg-white/50 rounded-full mt-2"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;