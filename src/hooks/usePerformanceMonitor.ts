import { useEffect } from 'react';
import { addResourceHints, registerServiceWorker } from '../lib/performance';

export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Add resource hints for better loading performance
    addResourceHints();

    // Register service worker for caching
    registerServiceWorker();

    // Monitor Core Web Vitals
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    };

    // Start monitoring after page load
    if (document.readyState === 'complete') {
      observeWebVitals();
    } else {
      window.addEventListener('load', observeWebVitals);
    }

    // Memory usage monitoring (if available)
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }
    };

    // Monitor memory every 30 seconds in development
    let memoryInterval: NodeJS.Timeout;
    if (process.env.NODE_ENV === 'development') {
      memoryInterval = setInterval(monitorMemory, 30000);
    }

    return () => {
      if (memoryInterval) {
        clearInterval(memoryInterval);
      }
    };
  }, []);

  // Return performance utilities
  return {
    measureRender: (componentName: string, renderFn: () => void) => {
      const start = performance.now();
      renderFn();
      const end = performance.now();
      console.log(`${componentName} render time: ${end - start}ms`);
    },
    
    trackUserInteraction: (interactionType: string) => {
      console.log(`User interaction: ${interactionType} at ${Date.now()}`);
    }
  };
};