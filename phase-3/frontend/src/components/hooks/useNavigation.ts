/**
 * useNavigation Hook
 *
 * Custom hook for navigation state and operations.
 * Handles path tracking, mobile menu state, and hover interactions.
 */

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NavigationState } from "@/types/components";

/**
 * useNavigation - Navigation state management hook
 * Tracks current path, mobile menu state, and hover interactions
 */
export function useNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Update mobile menu state
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  // Update hover state
  const handleHoverChange = (hovering: boolean) => {
    setIsHovering(hovering);
  };

  // Close mobile menu when path changes
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobileMenuOpen]);

  const navigationState: NavigationState = {
    currentPath: pathname || '/',
    isMobileMenuOpen,
    isHovering,
  };

  return {
    // State
    ...navigationState,

    // Actions
    toggleMobileMenu,
    closeMobileMenu,
    openMobileMenu,
    handleHoverChange,

    // Helpers
    navigate: (path: string) => {
      // This will be handled by Next.js Link or router.push
      // We provide this for interface consistency
      window.location.href = path;
    },

    // Boolean helpers
    isHome: pathname === '/',
    isPublicPath: pathname?.startsWith('/auth') || pathname === '/',
    isDashboardPath: pathname?.startsWith('/dashboard') || pathname?.startsWith('/tasks') || pathname?.startsWith('/profile'),
  };
}

/**
 * useMobileMenu - Mobile menu specific hook
 */
export function useMobileMenu() {
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, openMobileMenu } = useNavigation();

  return {
    isOpen: isMobileMenuOpen,
    toggle: toggleMobileMenu,
    close: closeMobileMenu,
    open: openMobileMenu,
  };
}

/**
 * usePathMatch - Check if current path matches pattern
 */
export function usePathMatch(pattern: string | string[]) {
  const pathname = usePathname();

  if (Array.isArray(pattern)) {
    return pattern.some(p => pathname === p || pathname?.startsWith(p));
  }

  return pathname === pattern || pathname?.startsWith(pattern);
}

/**
 * useNavigationHover - Hover state management for navigation
 */
export function useNavigationHover() {
  const { isHovering, handleHoverChange } = useNavigation();

  return {
    isHovering,
    onMouseEnter: () => handleHoverChange(true),
    onMouseLeave: () => handleHoverChange(false),
  };
}