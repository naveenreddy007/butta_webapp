// SEO utility functions

export interface SEOMetaTags {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  structuredData?: object;
}

export const updateMetaTags = (metaTags: SEOMetaTags) => {
  // Update title
  document.title = metaTags.title;

  // Update or create meta tags
  const updateMetaTag = (name: string, content: string, property?: boolean) => {
    const attribute = property ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  };

  // Basic meta tags
  updateMetaTag('description', metaTags.description);
  updateMetaTag('keywords', metaTags.keywords.join(', '));

  // Open Graph tags
  updateMetaTag('og:title', metaTags.ogTitle || metaTags.title, true);
  updateMetaTag('og:description', metaTags.ogDescription || metaTags.description, true);
  updateMetaTag('og:type', 'website', true);
  
  if (metaTags.ogImage) {
    updateMetaTag('og:image', metaTags.ogImage, true);
  }
  
  if (metaTags.ogUrl) {
    updateMetaTag('og:url', metaTags.ogUrl, true);
  }

  // Twitter Card tags
  updateMetaTag('twitter:card', metaTags.twitterCard || 'summary_large_image');
  updateMetaTag('twitter:title', metaTags.twitterTitle || metaTags.title);
  updateMetaTag('twitter:description', metaTags.twitterDescription || metaTags.description);
  
  if (metaTags.twitterImage) {
    updateMetaTag('twitter:image', metaTags.twitterImage);
  }

  // Canonical URL
  if (metaTags.canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = metaTags.canonicalUrl;
  }

  // Structured Data
  if (metaTags.structuredData) {
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(metaTags.structuredData);
  }
};

export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};

export const generateLocalBusinessStructuredData = (businessInfo: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "name": businessInfo.name,
    "description": "Premium wedding and event convention hall in Madhapur, Hyderabad",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": businessInfo.contact.landmark,
      "addressLocality": "Madhapur",
      "addressRegion": "Telangana",
      "postalCode": "500081",
      "addressCountry": "IN"
    },
    "telephone": businessInfo.contact.phone,
    "email": businessInfo.contact.email,
    "url": businessInfo.contact.website,
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
    },
    "openingHours": "Mo-Su 09:00-22:00",
    "paymentAccepted": "Cash, Credit Card, Bank Transfer",
    "currenciesAccepted": "INR"
  };
};