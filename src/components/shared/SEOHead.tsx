import { useEffect } from 'react';
import { updateMetaTags, generateLocalBusinessStructuredData, type SEOMetaTags } from '../../lib/seo';
import { initializeGoogleAnalytics, initializeScrollTracking, trackWebVitals } from '../../lib/analytics';
import { buttaBusinessInfo } from '../../data/businessInfo';

interface SEOHeadProps {
  metaTags: SEOMetaTags;
  enableAnalytics?: boolean;
  googleAnalyticsId?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ 
  metaTags, 
  enableAnalytics = false, 
  googleAnalyticsId 
}) => {
  useEffect(() => {
    // Update meta tags
    updateMetaTags({
      ...metaTags,
      structuredData: generateLocalBusinessStructuredData(buttaBusinessInfo)
    });

    // Initialize analytics if enabled
    if (enableAnalytics && googleAnalyticsId) {
      initializeGoogleAnalytics(googleAnalyticsId);
      initializeScrollTracking();
      trackWebVitals();
    }
  }, [metaTags, enableAnalytics, googleAnalyticsId]);

  return null; // This component doesn't render anything
};

export default SEOHead;