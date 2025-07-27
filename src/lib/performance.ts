// Performance optimization utilities

// Lazy loading utility for images
export const createLazyImageObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01
    }
  );

  return observer;
};

// Debounce utility for performance-sensitive operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Preload critical images
export const preloadImages = (imageUrls: string[]): Promise<void[]> => {
  const promises = imageUrls.map((url) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  });

  return Promise.all(promises);
};

// Optimize image loading with WebP support
export const getOptimizedImageUrl = (originalUrl: string, width?: number, quality = 80): string => {
  // Check if browser supports WebP
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })();

  // If it's already an optimized URL (like Unsplash), add parameters
  if (originalUrl.includes('unsplash.com')) {
    let optimizedUrl = originalUrl;
    
    // Add width parameter
    if (width) {
      optimizedUrl += optimizedUrl.includes('?') ? '&' : '?';
      optimizedUrl += `w=${width}`;
    }
    
    // Add quality parameter
    optimizedUrl += optimizedUrl.includes('?') ? '&' : '?';
    optimizedUrl += `q=${quality}`;
    
    // Add format parameter for WebP if supported
    if (supportsWebP) {
      optimizedUrl += '&fm=webp';
    }
    
    return optimizedUrl;
  }

  return originalUrl;
};

// Bundle size optimization - dynamic imports
export const loadComponentAsync = <T>(
  importFunc: () => Promise<{ default: T }>
): Promise<T> => {
  return importFunc().then(module => module.default);
};

// Memory management for large lists
export const createVirtualizedList = (
  items: any[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) => {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  return {
    visibleItems: items.slice(visibleStart, visibleEnd),
    visibleStart,
    visibleEnd,
    totalHeight: items.length * itemHeight,
    offsetY: visibleStart * itemHeight
  };
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Critical resource hints
export const addResourceHints = () => {
  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://images.unsplash.com'
  ];

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });

  // DNS prefetch for other domains
  const dnsPrefetchDomains = [
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com'
  ];

  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};