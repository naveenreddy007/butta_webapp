// Analytics utility functions

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const initializeGoogleAnalytics = (measurementId: string) => {
  // Create script tag for Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href
  });
};

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: pagePath,
      page_title: pageTitle || document.title
    });
  }
};

// Predefined event tracking functions
export const trackFormSubmission = (formType: string, success: boolean) => {
  trackEvent('form_submit', {
    form_type: formType,
    success: success
  });
};

export const trackPhoneCall = () => {
  trackEvent('phone_call', {
    event_category: 'engagement',
    event_label: 'header_phone_click'
  });
};

export const trackWhatsAppClick = () => {
  trackEvent('whatsapp_click', {
    event_category: 'engagement',
    event_label: 'whatsapp_button'
  });
};

export const trackGalleryView = (albumName: string) => {
  trackEvent('gallery_view', {
    event_category: 'engagement',
    album_name: albumName
  });
};

export const trackCTAClick = (ctaText: string, location: string) => {
  trackEvent('cta_click', {
    event_category: 'engagement',
    cta_text: ctaText,
    location: location
  });
};

export const trackScrollDepth = (percentage: number) => {
  trackEvent('scroll', {
    event_category: 'engagement',
    scroll_depth: percentage
  });
};

// Scroll depth tracking
export const initializeScrollTracking = () => {
  let maxScroll = 0;
  const milestones = [25, 50, 75, 90, 100];
  const tracked = new Set<number>();

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);
          trackScrollDepth(milestone);
        }
      });
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

// Performance tracking
export const trackWebVitals = () => {
  // Track Core Web Vitals if available
  if ('web-vital' in window) {
    // This would integrate with web-vitals library if installed
    // For now, we'll track basic performance metrics
    
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        trackEvent('page_load_time', {
          event_category: 'performance',
          load_time: Math.round(navigation.loadEventEnd - navigation.fetchStart)
        });
      }
    });
  }
};