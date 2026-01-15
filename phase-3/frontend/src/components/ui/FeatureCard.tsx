/**
 * Card Component
 *
 * Feature card with hover interactions and animations.
 * Follows Modern Technical Editorial design system.
 */

"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CardProps } from "@/types/components";
import { hoverScale } from "@/lib/animations";
import { COLORS } from "@/lib/constants";

// Icon mapping (since we're using string identifiers)
const IconMap: { [key: string]: React.ReactNode } = {
  zap: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  lightning: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  shield: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  code: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  database: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  lock: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

export function FeatureCard({ title, description, icon, benefits }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get icon component from string identifier
  const iconComponent = typeof icon === 'string' ? IconMap[icon] : icon;

  return (
    <motion.div
      className="bg-background border border-structure/30 p-8 rounded-lg cursor-pointer h-full flex flex-col hover:border-accent transition-colors"
      variants={hoverScale}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Icon Container */}
      <div className={`mb-4 p-3 rounded-lg transition-colors ${isHovered ? 'bg-accent/10' : 'bg-surface'}`}>
        <div className="text-accent" style={{ color: COLORS.ACCENT }}>
          {iconComponent}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-serif text-xl text-foreground mb-2 leading-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-foreground-secondary mb-4 flex-grow leading-relaxed">
        {description}
      </p>

      {/* Benefits List */}
      <ul className="font-mono text-xs space-y-1 text-foreground/80">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isHovered ? 'bg-accent' : 'bg-structure'}`} />
            {benefit}
          </li>
        ))}
      </ul>

      {/* Technical Line at Bottom */}
      <div className="mt-6 h-px bg-structure/20 overflow-hidden">
        <motion.div
          className="h-full bg-accent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

/**
 * Card Skeleton
 * Loading state for Card component
 */
export function CardSkeleton() {
  return (
    <div className="bg-background border border-structure/30 p-8 rounded-lg h-full flex flex-col animate-pulse">
      <div className="mb-4 p-3 rounded-lg bg-surface">
        <div className="w-6 h-6 bg-structure/30 rounded" />
      </div>
      <div className="h-6 bg-structure/30 rounded mb-2" />
      <div className="h-4 bg-structure/30 rounded mb-4 flex-grow" />
      <div className="space-y-2">
        <div className="h-3 bg-structure/30 rounded w-3/4" />
        <div className="h-3 bg-structure/30 rounded w-2/3" />
        <div className="h-3 bg-structure/30 rounded w-1/2" />
      </div>
      <div className="mt-6 h-px bg-structure/20" />
    </div>
  );
}