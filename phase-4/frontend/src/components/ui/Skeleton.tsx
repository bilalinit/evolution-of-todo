/**
 * Skeleton Component
 * Modern Technical Editorial Design System
 */

import * as React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rectangle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'text' }) => {
  const baseClasses = 'bg-[#2A1B12]/10 animate-pulse rounded-md relative overflow-hidden';

  const variantClasses = {
    text: 'h-4 w-full',
    circle: 'rounded-full',
    rectangle: 'w-full',
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
};

// Skeleton Text Line
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={index === lines - 1 ? 'w-2/3' : className}
        />
      ))}
    </div>
  );
};

// Skeleton Card
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`space-y-3 p-4 border border-[#2A1B12]/10 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton variant="circle" className="w-6 h-6" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton variant="rectangle" className="w-16 h-6 rounded-full" />
        <Skeleton variant="rectangle" className="w-16 h-6 rounded-full" />
      </div>
    </div>
  );
};

// Skeleton List
export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({
  count = 5,
  className
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

// Skeleton Table Row
export const SkeletonTableRow: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-4 p-3 border-b border-[#2A1B12]/10 ${className}`}>
      <Skeleton variant="rectangle" className="w-4 h-4" />
      <Skeleton variant="text" className="flex-1" />
      <Skeleton variant="text" className="w-20" />
      <Skeleton variant="text" className="w-16" />
      <Skeleton variant="circle" className="w-6 h-6" />
    </div>
  );
};