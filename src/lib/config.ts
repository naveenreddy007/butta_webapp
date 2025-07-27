// Application configuration

export const config = {
  // Analytics
  googleAnalyticsId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
  
  // Contact Form
  emailjs: {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
  },
  
  // Business Information
  business: {
    phone: import.meta.env.VITE_BUSINESS_PHONE || '+91 88018 86108',
    email: import.meta.env.VITE_BUSINESS_EMAIL || 'info@buttaconvention.com',
    whatsapp: import.meta.env.VITE_BUSINESS_WHATSAPP || '918801886108'
  },
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    cdnUrl: import.meta.env.VITE_CDN_BASE_URL || ''
  },
  
  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    chatWidget: import.meta.env.VITE_ENABLE_CHAT_WIDGET === 'true',
    bookingSystem: import.meta.env.VITE_ENABLE_BOOKING_SYSTEM === 'true'
  },
  
  // Development
  development: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    showPerformanceMetrics: import.meta.env.VITE_SHOW_PERFORMANCE_METRICS === 'true'
  },
  
  // Build Information
  build: {
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    buildDate: import.meta.env.VITE_BUILD_DATE || new Date().toISOString(),
    environment: import.meta.env.MODE || 'development'
  }
};

// Validation function to check required environment variables
export const validateConfig = () => {
  const errors: string[] = [];
  
  if (config.features.analytics && !config.googleAnalyticsId) {
    errors.push('Google Analytics ID is required when analytics is enabled');
  }
  
  if (!config.business.phone) {
    errors.push('Business phone number is required');
  }
  
  if (!config.business.email) {
    errors.push('Business email is required');
  }
  
  if (errors.length > 0) {
    console.warn('Configuration validation errors:', errors);
    
    if (config.development.debugMode) {
      console.table(config);
    }
  }
  
  return errors.length === 0;
};

// Initialize configuration
export const initializeConfig = () => {
  const isValid = validateConfig();
  
  if (config.development.debugMode) {
    console.log('Application configuration:', config);
    console.log('Configuration valid:', isValid);
  }
  
  return isValid;
};