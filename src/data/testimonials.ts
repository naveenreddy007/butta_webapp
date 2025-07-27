import type { Testimonial } from '../types/landing';

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sravani & Karthik',
    eventType: 'Wedding',
    rating: 5,
    comment: 'The venue was absolutely beautiful, and the team handled everything seamlessly. Our wedding day was perfect thanks to Butta Convention!',
    date: '2024-12-15',
    image: '/testimonials/sravani-karthik.jpg'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    eventType: 'Corporate Event',
    rating: 5,
    comment: 'Ideal location, perfect service, food was amazing! Our annual company event was a huge success. Highly recommend for corporate functions.',
    date: '2024-11-20',
    image: '/testimonials/rajesh.jpg'
  },
  {
    id: '3',
    name: 'Priya & Arjun',
    eventType: 'Reception',
    rating: 5,
    comment: 'Beautiful outdoor lawn setup for our reception. The decoration team exceeded our expectations and the catering was exceptional.',
    date: '2024-10-08',
    image: '/testimonials/priya-arjun.jpg'
  }
];