// Mobile utility functions and touch interaction helpers

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

export const getTouchEventHandlers = () => {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
  };

  const getSwipeDirection = () => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        return deltaX > 0 ? 'right' : 'left';
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        return deltaY > 0 ? 'down' : 'up';
      }
    }
    return null;
  };

  return {
    handleTouchStart,
    handleTouchEnd,
    getSwipeDirection
  };
};

export const addTouchSupport = (element: HTMLElement, callbacks: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}) => {
  const { handleTouchStart, handleTouchEnd, getSwipeDirection } = getTouchEventHandlers();

  const onTouchStart = (e: TouchEvent) => {
    handleTouchStart(e);
  };

  const onTouchEnd = (e: TouchEvent) => {
    handleTouchEnd(e);
    const direction = getSwipeDirection();
    
    switch (direction) {
      case 'left':
        callbacks.onSwipeLeft?.();
        break;
      case 'right':
        callbacks.onSwipeRight?.();
        break;
      case 'up':
        callbacks.onSwipeUp?.();
        break;
      case 'down':
        callbacks.onSwipeDown?.();
        break;
    }
  };

  element.addEventListener('touchstart', onTouchStart, { passive: true });
  element.addEventListener('touchend', onTouchEnd, { passive: true });

  return () => {
    element.removeEventListener('touchstart', onTouchStart);
    element.removeEventListener('touchend', onTouchEnd);
  };
};

export const optimizeForMobile = () => {
  // Prevent zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Improve touch scrolling
  document.addEventListener('touchmove', (event) => {
    if (event.scale !== 1) {
      event.preventDefault();
    }
  }, { passive: false });
};

export const getOptimalImageSize = (containerWidth: number): string => {
  if (containerWidth <= 480) return 'w=480&q=75';
  if (containerWidth <= 768) return 'w=768&q=80';
  if (containerWidth <= 1024) return 'w=1024&q=85';
  return 'w=1920&q=90';
};