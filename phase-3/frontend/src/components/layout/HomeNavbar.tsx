/**
 * HomeNavbar Component
 *
 * Navigation bar for public landing page.
 * Shows logo, navigation links, and auth buttons.
 * Uses Modern Technical Editorial design system.
 */

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAVIGATION_LINKS } from "@/lib/constants";
import { useAuthState, useAuthActions } from "@/components/hooks/useAuth";

export function HomeNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuthState();
  const { signOut } = useAuthActions();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-foreground/10 shadow-sm"
          : "bg-background border-b border-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href="/"
                className="flex items-center gap-2 group"
                onClick={closeMobileMenu}
              >
                <span className="font-serif text-xl md:text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                  PlanStack
                </span>
                <span className="text-xs font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  BETA
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:flex items-center gap-8"
            >
              {/* Navigation Links */}
              <div className="flex items-center gap-6">
                {isAuthenticated ? (
                  // Authenticated user navigation
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href="/tasks"
                        className="text-sm font-medium text-foreground-secondary hover:text-accent transition-colors relative group"
                      >
                        Tasks
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href="/chatkit"
                        className="text-sm font-medium text-foreground-secondary hover:text-accent transition-colors relative group"
                      >
                        AI Assistant
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href="/profile"
                        className="text-sm font-medium text-foreground-secondary hover:text-accent transition-colors relative group"
                      >
                        Profile
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  // Public navigation
                  NAVIGATION_LINKS.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.2 + (index * 0.05),
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-foreground-secondary hover:text-accent transition-colors relative group"
                      >
                        {link.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
                {isLoading ? (
                  <div className="h-8 w-20 bg-structure/20 rounded animate-pulse" />
                ) : isAuthenticated ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {user?.name || user?.email}
                      </span>
                      <motion.div
                        className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-mono text-xs"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {(user?.name || user?.email)?.[0]?.toUpperCase()}
                      </motion.div>
                      <button
                        onClick={() => signOut()}
                        className="px-3 py-1.5 text-sm font-medium text-foreground hover:text-accent transition-colors"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href="/login"
                        className="px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
                      >
                        Sign In
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href="/signup"
                        className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-[#ff856a] transition-colors"
                      >
                        Get Started
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-foreground hover:text-accent transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden border-t border-foreground/10 bg-background"
            >
              <div className="px-6 py-4 space-y-4">
                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-3">
                  {isAuthenticated ? (
                    // Authenticated user navigation
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Link
                          href="/tasks"
                          className="block py-2 text-foreground-secondary hover:text-accent transition-colors font-medium"
                          onClick={closeMobileMenu}
                        >
                          Tasks
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Link
                          href="/chatkit"
                          className="block py-2 text-foreground-secondary hover:text-accent transition-colors font-medium"
                          onClick={closeMobileMenu}
                        >
                          AI Assistant
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Link
                          href="/profile"
                          className="block py-2 text-foreground-secondary hover:text-accent transition-colors font-medium"
                          onClick={closeMobileMenu}
                        >
                          Profile
                        </Link>
                      </motion.div>
                    </>
                  ) : (
                    // Public navigation
                    NAVIGATION_LINKS.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: 0.1 + (index * 0.05),
                          ease: [0.22, 1, 0.36, 1]
                        }}
                      >
                        <Link
                          href={link.href}
                          className="block py-2 text-foreground-secondary hover:text-accent transition-colors font-medium"
                          onClick={closeMobileMenu}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Mobile Auth Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex flex-col gap-2 pt-2 border-t border-foreground/10"
                >
                  {isLoading ? (
                    <div className="h-8 w-full bg-structure/20 rounded animate-pulse" />
                  ) : isAuthenticated ? (
                    <>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-foreground font-medium">
                          {user?.name || user?.email}
                        </span>
                        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white font-mono text-xs">
                          {(user?.name || user?.email)?.[0]?.toUpperCase()}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          closeMobileMenu();
                        }}
                        className="w-full py-2 text-center text-foreground hover:text-accent transition-colors font-medium"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="w-full py-2 text-center text-foreground hover:text-accent transition-colors font-medium"
                        onClick={closeMobileMenu}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="w-full py-2 text-center bg-accent text-white rounded-md hover:bg-[#ff856a] transition-colors font-medium"
                        onClick={closeMobileMenu}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16" />
    </>
  );
}

/**
 * HomeNavbar Skeleton
 * Loading state for HomeNavbar component
 */
export function HomeNavbarSkeleton() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-foreground/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="h-8 w-24 bg-structure/30 rounded animate-pulse" />
          <div className="hidden md:flex items-center gap-6">
            <div className="h-4 w-16 bg-structure/20 rounded animate-pulse" />
            <div className="h-4 w-16 bg-structure/20 rounded animate-pulse" />
            <div className="h-4 w-16 bg-structure/20 rounded animate-pulse" />
            <div className="h-4 w-16 bg-structure/20 rounded animate-pulse" />
            <div className="h-8 w-20 bg-structure/20 rounded animate-pulse" />
            <div className="h-8 w-24 bg-structure/30 rounded animate-pulse" />
          </div>
          <div className="md:hidden h-6 w-6 bg-structure/20 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-16" />
    </nav>
  );
}