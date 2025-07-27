import React from 'react';

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ className }) => {
  return (
    <div className={className}>
      <p className="text-gray-600">Image carousel component - coming soon...</p>
    </div>
  );
};

export default ImageCarousel;