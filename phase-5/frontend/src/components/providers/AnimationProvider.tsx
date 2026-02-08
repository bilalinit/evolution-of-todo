/**
 * AnimationProvider Component
 *
 * Provides animation configuration and preferences to the application.
 * Handles reduced motion preferences and animation settings.
 */

"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";

interface AnimationContextType {
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  // Check for user's motion preference
  const [reducedMotion, setReducedMotion] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  useEffect(() => {
    // Check system preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  const contextValue: AnimationContextType = {
    reducedMotion,
    toggleReducedMotion,
    animationSpeed,
    setAnimationSpeed,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
}

/**
 * useAnimation hook - Access animation preferences
 */
export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimation must be used within AnimationProvider");
  }
  return context;
}

/**
 * useReducedMotion hook - Check if reduced motion is enabled
 */
export function useReducedMotion() {
  const { reducedMotion } = useAnimation();
  return reducedMotion;
}

/**
 * useAnimationSpeed hook - Get current animation speed
 */
export function useAnimationSpeed() {
  const { animationSpeed } = useAnimation();
  return animationSpeed;
}