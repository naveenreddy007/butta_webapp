// TypeScript interfaces for landing page components

export interface CTAButton {
  text: string;
  variant: 'primary' | 'secondary' | 'outline';
  action: 'scroll' | 'phone' | 'whatsapp' | 'form';
  target: string;
}

export interface NavigationProps {
  activeSection: string;
  onSectionClick: (section: string) => void;
}

export interface HeroProps {
  backgroundMedia: MediaItem[];
  heading: string;
  subheading?: string;
  ctaButtons: CTAButton[];
}

export interface HighlightItem {
  icon: string;
  title: string;
  description: string;
}

export interface VenueDetail {
  feature: string;
  description: string;
  icon?: string;
}

export interface AboutProps {
  description: string;
  highlights: HighlightItem[];
  venueDetails: VenueDetail[];
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  thumbnail: string;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  images: GalleryImage[];
}

export interface GalleryProps {
  albums: GalleryAlbum[];
  defaultAlbum?: string;
}

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  message: string;
}

export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  isLoading: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  eventType: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  structuredData: object;
}

export interface MediaItem {
  type: 'image' | 'video';
  src: string;
  alt?: string;
}

export interface LandingPageData {
  hero: {
    backgroundMedia: MediaItem[];
    heading: string;
    subheading: string;
    ctaButtons: CTAButton[];
  };
  testimonials: Testimonial[];
  gallery: GalleryAlbum[];
  seo: SEOData;
}