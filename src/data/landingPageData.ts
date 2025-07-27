import type { LandingPageData } from '../types/landing';
import { testimonials } from './testimonials';
import { galleryAlbums } from './galleryImages';
import { seoData } from './seoData';

export const landingPageData: LandingPageData = {
  hero: {
    backgroundMedia: [
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        alt: 'Elegant wedding venue with beautiful lighting'
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        alt: 'Outdoor wedding ceremony setup'
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        alt: 'Reception hall with elegant table settings'
      }
    ],
    heading: 'Celebrate Grand, Celebrate at Butta Convention',
    subheading: 'Where elegance meets tradition in the heart of Madhapur. Your perfect venue for weddings, receptions, and memorable celebrations.',
    ctaButtons: [
      {
        text: 'Book a Visit',
        variant: 'primary',
        action: 'scroll',
        target: 'contact'
      },
      {
        text: 'Call Us',
        variant: 'secondary',
        action: 'phone',
        target: '+91 88018 86108'
      },
      {
        text: 'Get Quote',
        variant: 'outline',
        action: 'whatsapp',
        target: '+91 88018 86108'
      }
    ]
  },
  testimonials,
  gallery: galleryAlbums,
  seo: seoData
};