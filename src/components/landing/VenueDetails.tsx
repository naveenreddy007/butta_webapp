import React from 'react';
import SectionWrapper from '../shared/SectionWrapper';

const VenueDetails: React.FC = () => {
  return (
    <SectionWrapper background="white">
      <div className="text-center">
        <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-6">
          Venue Details
        </h2>
        <p className="text-lg text-gray-600">
          Detailed venue information coming soon...
        </p>
      </div>
    </SectionWrapper>
  );
};

export default VenueDetails;