import React from 'react';
import { 
  Hero, 
  About, 
  Gallery, 
  VenueDetails, 
  EventTypes, 
  Testimonials, 
  Contact, 
  Navigation 
} from '../components/landing';
import SEOHead from '../components/shared/SEOHead';
import { landingPageData } from '../data/landingPageData';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

const LandingPage: React.FC = () => {
  const sectionIds = ['home', 'venue', 'gallery', 'packages', 'testimonials', 'contact'];
  const activeSection = useScrollSpy(sectionIds, 100);
  const { measureRender, trackUserInteraction } = usePerformanceMonitor();

  const handleSectionClick = (section: string) => {
    trackUserInteraction(`navigation_click_${section}`);
    // Smooth scroll to section
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        metaTags={landingPageData.seo}
        enableAnalytics={true}
        googleAnalyticsId={import.meta.env.VITE_GA_MEASUREMENT_ID}
      />
      <Navigation 
        activeSection={activeSection}
        onSectionClick={handleSectionClick}
      />
      
      <main>
        <section id="home">
          <Hero {...landingPageData.hero} />
        </section>
        
        <section id="venue">
          <About 
            description="Located in the heart of Madhapur, Butta Convention offers a blend of elegance, tradition, and modern convenience for weddings, events, and corporate functions."
            highlights={[
              {
                icon: 'MapPin',
                title: 'Central Location',
                description: 'Opposite Cyber Towers, KPHB Road'
              },
              {
                icon: 'Building',
                title: 'Indoor + Outdoor Spaces',
                description: 'A/C Hall and Open Lawn'
              },
              {
                icon: 'Users',
                title: 'Up to 1000 Guests',
                description: 'Flexible seating arrangements'
              },
              {
                icon: 'Car',
                title: 'Valet Parking',
                description: '120+ cars, 200+ bikes'
              },
              {
                icon: 'Utensils',
                title: 'In-house Catering & Decor',
                description: 'Complete event solutions'
              }
            ]}
            venueDetails={[
              { feature: 'Seating', description: 'Indoor 400–500, Floating up to 1000', icon: 'Users' },
              { feature: 'Spaces', description: 'A/C Hall, Open Lawn', icon: 'Building' },
              { feature: 'Rooms', description: '2 Luxury Suites', icon: 'Bed' },
              { feature: 'Catering', description: 'Veg & Non-Veg Options', icon: 'Utensils' },
              { feature: 'Parking', description: '120+ Cars, 200+ Bikes', icon: 'Car' },
              { feature: 'Décor', description: 'In-house & Partner Decorators', icon: 'Palette' },
              { feature: 'Accessibility', description: 'Wheelchair friendly, Wide entrance', icon: 'Accessibility' }
            ]}
          />
          <VenueDetails />
        </section>
        
        <section id="gallery">
          <Gallery 
            albums={landingPageData.gallery}
            defaultAlbum="wedding-decor"
          />
        </section>
        
        <section id="packages">
          <EventTypes />
        </section>
        
        <section id="testimonials">
          <Testimonials />
        </section>
        
        <section id="contact">
          <Contact />
        </section>
      </main>
    </div>
  );
};

export default LandingPage;