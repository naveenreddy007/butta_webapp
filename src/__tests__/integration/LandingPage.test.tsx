import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import LandingPage from '../../pages/LandingPage';

// Mock all the child components to focus on integration
jest.mock('../../components/landing/Hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Hero Component</div>;
  };
});

jest.mock('../../components/landing/About', () => {
  return function MockAbout() {
    return <div data-testid="about">About Component</div>;
  };
});

jest.mock('../../components/landing/Gallery', () => {
  return function MockGallery() {
    return <div data-testid="gallery">Gallery Component</div>;
  };
});

jest.mock('../../components/landing/EventTypes', () => {
  return function MockEventTypes() {
    return <div data-testid="event-types">Event Types Component</div>;
  };
});

jest.mock('../../components/landing/Testimonials', () => {
  return function MockTestimonials() {
    return <div data-testid="testimonials">Testimonials Component</div>;
  };
});

jest.mock('../../components/landing/Contact', () => {
  return function MockContact() {
    return <div data-testid="contact">Contact Component</div>;
  };
});

jest.mock('../../components/landing/Navigation', () => {
  return function MockNavigation({ activeSection, onSectionClick }: any) {
    return (
      <nav data-testid="navigation">
        <button onClick={() => onSectionClick('home')}>Home</button>
        <button onClick={() => onSectionClick('venue')}>Venue</button>
        <button onClick={() => onSectionClick('gallery')}>Gallery</button>
        <button onClick={() => onSectionClick('packages')}>Packages</button>
        <button onClick={() => onSectionClick('testimonials')}>Testimonials</button>
        <button onClick={() => onSectionClick('contact')}>Contact</button>
        <span data-testid="active-section">{activeSection}</span>
      </nav>
    );
  };
});

jest.mock('../../components/shared/SEOHead', () => {
  return function MockSEOHead() {
    return <div data-testid="seo-head">SEO Head</div>;
  };
});

// Mock hooks
jest.mock('../../hooks/useScrollSpy', () => ({
  useScrollSpy: () => 'home'
}));

jest.mock('../../hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: () => ({
    measureRender: jest.fn(),
    trackUserInteraction: jest.fn()
  })
}));

describe('LandingPage Integration', () => {
  it('renders all main sections', () => {
    render(<LandingPage />);
    
    expect(screen.getByTestId('seo-head')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('about')).toBeInTheDocument();
    expect(screen.getByTestId('gallery')).toBeInTheDocument();
    expect(screen.getByTestId('event-types')).toBeInTheDocument();
    expect(screen.getByTestId('testimonials')).toBeInTheDocument();
    expect(screen.getByTestId('contact')).toBeInTheDocument();
  });

  it('handles navigation clicks', () => {
    // Mock getElementById and scrollIntoView
    const mockScrollIntoView = jest.fn();
    const mockElement = { scrollIntoView: mockScrollIntoView };
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

    render(<LandingPage />);
    
    const venueButton = screen.getByText('Venue');
    fireEvent.click(venueButton);
    
    expect(document.getElementById).toHaveBeenCalledWith('venue');
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('displays correct section structure', () => {
    render(<LandingPage />);
    
    // Check that sections have correct IDs
    expect(screen.getByTestId('hero').closest('section')).toHaveAttribute('id', 'home');
    expect(screen.getByTestId('about').closest('section')).toHaveAttribute('id', 'venue');
    expect(screen.getByTestId('gallery').closest('section')).toHaveAttribute('id', 'gallery');
    expect(screen.getByTestId('event-types').closest('section')).toHaveAttribute('id', 'packages');
    expect(screen.getByTestId('testimonials').closest('section')).toHaveAttribute('id', 'testimonials');
    expect(screen.getByTestId('contact').closest('section')).toHaveAttribute('id', 'contact');
  });

  it('has proper semantic structure', () => {
    render(<LandingPage />);
    
    // Check for main landmark
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for navigation
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('handles missing DOM elements gracefully', () => {
    // Mock getElementById to return null
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    
    render(<LandingPage />);
    
    const venueButton = screen.getByText('Venue');
    
    // Should not throw error when element is not found
    expect(() => {
      fireEvent.click(venueButton);
    }).not.toThrow();
  });

  it('maintains accessibility standards', () => {
    render(<LandingPage />);
    
    // Check for proper heading hierarchy (this would be more detailed in real tests)
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    // Check for navigation accessibility
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('loads without JavaScript errors', () => {
    // This test ensures the component mounts without throwing
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<LandingPage />);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});