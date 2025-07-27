import type { SEOData } from '../types/landing';

export const seoData: SEOData = {
  title: 'Butta Convention Madhapur - Premium Wedding & Event Venue in Hyderabad',
  description: 'Celebrate grand at Butta Convention Madhapur. Premium wedding venue with indoor hall, outdoor lawn, up to 1000 guests capacity. Located opposite Cyber Towers, KPHB Road.',
  keywords: [
    'Convention Hall in Madhapur',
    'Wedding Venue Hyderabad',
    'Event Hall Madhapur',
    'Marriage Hall Hyderabad',
    'Reception Venue Madhapur',
    'Corporate Event Venue',
    'Banquet Hall Hyderabad',
    'Wedding Hall near Cyber Towers',
    'Event Space Madhapur',
    'Party Hall Hyderabad'
  ],
  ogImage: '/og-image.jpg',
  structuredData: {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "name": "Butta Convention",
    "description": "Premium wedding and event convention hall in Madhapur, Hyderabad",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Opposite Cyber Towers, KPHB Road",
      "addressLocality": "Madhapur",
      "addressRegion": "Telangana",
      "postalCode": "500081",
      "addressCountry": "IN"
    },
    "telephone": "+91 88018 86108",
    "email": "info@buttaconvention.com",
    "url": "https://buttagroup.com",
    "image": "/og-image.jpg",
    "priceRange": "₹750-₹1000 per plate",
    "maximumAttendeeCapacity": 1000,
    "amenityFeature": [
      "Air Conditioning",
      "Parking",
      "Wheelchair Accessible",
      "Catering Service",
      "Decoration Service",
      "Bridal Suites"
    ],
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "17.4485",
      "longitude": "78.3908"
    }
  }
};