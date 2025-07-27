import { renderHook } from '@testing-library/react';
import { useScrollSpy } from '../../hooks/useScrollSpy';

// Mock DOM elements
const mockElements = {
  section1: { offsetTop: 0 },
  section2: { offsetTop: 500 },
  section3: { offsetTop: 1000 }
};

// Mock getElementById
jest.spyOn(document, 'getElementById').mockImplementation((id) => {
  return mockElements[id as keyof typeof mockElements] as any;
});

// Mock window properties
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0
});

describe('useScrollSpy Hook', () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', { value: 0 });
    
    // Clear event listeners
    jest.clearAllMocks();
  });

  it('returns first section as active initially', () => {
    const { result } = renderHook(() => 
      useScrollSpy(['section1', 'section2', 'section3'], 100)
    );
    
    expect(result.current).toBe('section1');
  });

  it('updates active section based on scroll position', () => {
    const { result, rerender } = renderHook(() => 
      useScrollSpy(['section1', 'section2', 'section3'], 100)
    );
    
    // Simulate scroll to section2
    Object.defineProperty(window, 'scrollY', { value: 600 });
    
    // Trigger scroll event
    const scrollEvent = new Event('scroll');
    window.dispatchEvent(scrollEvent);
    
    rerender();
    
    expect(result.current).toBe('section2');
  });

  it('handles offset correctly', () => {
    const { result, rerender } = renderHook(() => 
      useScrollSpy(['section1', 'section2', 'section3'], 200)
    );
    
    // With offset of 200, section2 should be active at scroll position 300
    Object.defineProperty(window, 'scrollY', { value: 300 });
    
    const scrollEvent = new Event('scroll');
    window.dispatchEvent(scrollEvent);
    
    rerender();
    
    expect(result.current).toBe('section2');
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => 
      useScrollSpy(['section1', 'section2', 'section3'], 100)
    );
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('handles empty section array', () => {
    const { result } = renderHook(() => useScrollSpy([], 100));
    
    expect(result.current).toBe('');
  });

  it('handles missing DOM elements gracefully', () => {
    // Mock getElementById to return null
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    
    const { result } = renderHook(() => 
      useScrollSpy(['nonexistent'], 100)
    );
    
    expect(result.current).toBe('nonexistent');
  });
});