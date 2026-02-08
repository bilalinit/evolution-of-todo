/**
 * useViewport Hook
 *
 * Custom hook for responsive viewport detection and tracking.
 * Provides real-time viewport size and responsive breakpoints.
 */

"use client";

import { useState, useEffect } from "react";
import { ViewportState } from "@/types/components";
import { BREAKPOINTS } from "@/lib/constants";

/**
 * useViewport - Viewport state and responsive utilities
 * Tracks viewport size and provides responsive helpers
 */
export function useViewport() {
  const [viewport, setViewport] = useState<ViewportState>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isMobile: width < BREAKPOINTS.MD,
        isTablet: width >= BREAKPOINTS.MD && width < BREAKPOINTS.LG,
        isDesktop: width >= BREAKPOINTS.LG,
      });
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    // Viewport state
    ...viewport,

    // Breakpoint helpers
    isSm: viewport.width < BREAKPOINTS.MD,
    isMd: viewport.width >= BREAKPOINTS.MD && viewport.width < BREAKPOINTS.LG,
    isLg: viewport.width >= BREAKPOINTS.LG && viewport.width < BREAKPOINTS.XL,
    isXl: viewport.width >= BREAKPOINTS.XL,

    // Responsive utilities
    isBetween: (min: number, max: number) => viewport.width >= min && viewport.width < max,
    isMin: (width: number) => viewport.width >= width,
    isMax: (width: number) => viewport.width < width,

    // Size helpers
    isPortrait: viewport.height > viewport.width,
    isLandscape: viewport.width > viewport.height,

    // Conditional rendering helper
    matches: (breakpoint: 'mobile' | 'tablet' | 'desktop') => {
      switch (breakpoint) {
        case 'mobile': return viewport.isMobile;
        case 'tablet': return viewport.isTablet;
        case 'desktop': return viewport.isDesktop;
        default: return false;
      }
    },
  };
}

/**
 * useBreakpoint - Check if current viewport matches breakpoint
 */
export function useBreakpoint(breakpoint: 'sm' | 'md' | 'lg' | 'xl') {
  const viewport = useViewport();

  switch (breakpoint) {
    case 'sm': return viewport.isSm;
    case 'md': return viewport.isMd;
    case 'lg': return viewport.isLg;
    case 'xl': return viewport.isXl;
    default: return false;
  }
}

/**
 * useResponsive - Responsive design utilities
 */
export function useResponsive() {
  const viewport = useViewport();

  return {
    // Get responsive value based on viewport
    responsive: <T,>(mobile: T, tablet: T, desktop: T): T => {
      if (viewport.isMobile) return mobile;
      if (viewport.isTablet) return tablet;
      return desktop;
    },

    // Get responsive class names
    className: (base: string, mobile?: string, tablet?: string, desktop?: string): string => {
      let classes = base;
      if (mobile && viewport.isMobile) classes += ` ${mobile}`;
      if (tablet && viewport.isTablet) classes += ` ${tablet}`;
      if (desktop && viewport.isDesktop) classes += ` ${desktop}`;
      return classes;
    },

    // Show/hide based on viewport
    show: (target: 'mobile' | 'tablet' | 'desktop' | 'all'): boolean => {
      if (target === 'all') return true;
      return viewport.matches(target);
    },

    // Hide based on viewport
    hide: (target: 'mobile' | 'tablet' | 'desktop'): boolean => {
      return !viewport.matches(target);
    },

    // Get current breakpoint name
    getBreakpoint: (): string => {
      if (viewport.isMobile) return 'mobile';
      if (viewport.isTablet) return 'tablet';
      return 'desktop';
    },
  };
}

/**
 * useWindowSize - Simple window size tracking
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * useMediaQuery - Check if media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}