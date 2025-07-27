// Test utilities for React Testing Library

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MotionConfig } from 'framer-motion';

// Mock IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Wrapper component that provides necessary context
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MotionConfig reducedMotion="always">
      {children}
    </MotionConfig>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Custom matchers
export const expectToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectToHaveAccessibleName = (element: HTMLElement, name: string) => {
  expect(element).toHaveAccessibleName(name);
};

// Mock data for tests
export const mockTestimonials = [
  {
    id: '1',
    name: 'Test User',
    eventType: 'Wedding',
    rating: 5,
    comment: 'Great venue!',
    date: '2024-01-01',
    image: '/test-image.jpg'
  }
];

export const mockGalleryAlbums = [
  {
    id: 'test-album',
    name: 'Test Album',
    images: [
      {
        src: '/test-image.jpg',
        alt: 'Test image',
        caption: 'Test caption',
        thumbnail: '/test-thumb.jpg'
      }
    ]
  }
];

export const mockHeroProps = {
  backgroundMedia: [
    {
      type: 'image' as const,
      src: '/test-bg.jpg',
      alt: 'Test background'
    }
  ],
  heading: 'Test Heading',
  subheading: 'Test Subheading',
  ctaButtons: [
    {
      text: 'Test Button',
      variant: 'primary' as const,
      action: 'scroll' as const,
      target: 'test-section'
    }
  ]
};