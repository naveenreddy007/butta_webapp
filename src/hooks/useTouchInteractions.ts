import { useRef, useState } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
}

interface UseTouchInteractionsOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
}

export function useTouchInteractions(options: UseTouchInteractionsOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    swipeThreshold = 50,
    longPressDelay = 500,
  } = options;

  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchEndRef = useRef<TouchPosition | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchEndRef.current = null;
    setIsLongPressing(false);

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        setIsLongPressing(true);
        onLongPress();
      }, longPressDelay);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    // Cancel long press if user moves finger
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touch = e.touches[0];
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current || !touchEndRef.current) {
      // This was a tap
      if (!isLongPressing && onTap) {
        onTap();
      }
      return;
    }

    const swipe = getSwipeDirection();
    
    if (swipe.distance >= swipeThreshold) {
      switch (swipe.direction) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }
    } else if (!isLongPressing && onTap) {
      // Small movement, treat as tap
      onTap();
    }

    // Reset
    touchStartRef.current = null;
    touchEndRef.current = null;
    setIsLongPressing(false);
  };

  const getSwipeDirection = (): SwipeDirection => {
    if (!touchStartRef.current || !touchEndRef.current) {
      return { direction: null, distance: 0 };
    }

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      return {
        direction: deltaX > 0 ? 'right' : 'left',
        distance,
      };
    } else {
      // Vertical swipe
      return {
        direction: deltaY > 0 ? 'down' : 'up',
        distance,
      };
    }
  };

  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return {
    touchHandlers,
    isLongPressing,
  };
}