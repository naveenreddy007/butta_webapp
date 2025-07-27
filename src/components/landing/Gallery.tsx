import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react';
import { Button } from '../ui/button';
import type { GalleryProps, GalleryImage } from '../../types/landing';
import SectionWrapper from '../shared/SectionWrapper';
import { cn } from '../../lib/utils';
import { addTouchSupport } from '../../lib/mobile';

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev
}) => {
  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !lightboxRef.current) return;

    const cleanup = addTouchSupport(lightboxRef.current, {
      onSwipeLeft: onNext,
      onSwipeRight: onPrev,
      onSwipeUp: onClose
    });

    return cleanup;
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen || !images[currentIndex]) return null;

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        ref={lightboxRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-7xl max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Image */}
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />

          {/* Image Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
            <p className="text-white text-lg font-medium mb-2">{currentImage.caption}</p>
            <p className="text-white/80 text-sm">
              {currentIndex + 1} of {images.length}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Gallery: React.FC<GalleryProps> = ({ albums, defaultAlbum }) => {
  const [activeAlbum, setActiveAlbum] = useState(defaultAlbum || albums[0]?.id || '');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const currentAlbum = albums.find(album => album.id === activeAlbum) || albums[0];
  const currentImages = currentAlbum?.images || [];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <SectionWrapper id="gallery" background="white" padding="xl">
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
            Our Gallery
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-amber-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Explore our beautiful venue through these carefully curated images showcasing our elegant spaces and memorable events
          </p>
        </motion.div>

        {/* Album Tabs */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setActiveAlbum(album.id)}
              className={cn(
                "px-6 py-3 rounded-full font-medium transition-all duration-300",
                activeAlbum === album.id
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {album.name}
            </button>
          ))}
        </motion.div>

        {/* Image Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAlbum}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentImages.map((image, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => openLightbox(index)}
              >
                {/* Image */}
                <img
                  src={image.thumbnail || image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-medium text-sm mb-2">
                      {image.caption}
                    </p>
                  </div>
                  
                  {/* Zoom Icon */}
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Loading placeholder */}
                <div className="absolute inset-0 bg-gray-200 animate-pulse opacity-0 group-hover:opacity-0" />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Album Info */}
        {currentAlbum && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-gray-600">
              Showing {currentImages.length} images from <span className="font-semibold text-green-600">{currentAlbum.name}</span>
            </p>
          </motion.div>
        )}

        {/* Lightbox */}
        <Lightbox
          images={currentImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      </div>
    </SectionWrapper>
  );
};

export default Gallery;