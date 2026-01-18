/**
 * Badge Component
 * Modern Technical Editorial Design System
 */

import * as React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className
}) => {
  const variantClasses = {
    default: 'bg-[#FF6B4A] text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    error: 'bg-red-600 text-white',
    neutral: 'bg-[#2A1B12]/10 text-[#2A1B12]',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-widest border border-[#2A1B12]/10 ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Priority Badge Component
interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = {
    low: { label: 'LOW', variant: 'neutral' as const },
    medium: { label: 'MED', variant: 'warning' as const },
    high: { label: 'HIGH', variant: 'error' as const },
  };

  const { label, variant } = config[priority];

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
};

// Category Badge Component
interface CategoryBadgeProps {
  category: 'work' | 'personal' | 'shopping' | 'health' | 'other';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const config = {
    work: { label: 'WORK', variant: 'default' as const },
    personal: { label: 'PERSONAL', variant: 'success' as const },
    shopping: { label: 'SHOPPING', variant: 'warning' as const },
    health: { label: 'HEALTH', variant: 'success' as const },
    other: { label: 'OTHER', variant: 'neutral' as const },
  };

  const { label, variant } = config[category];

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  completed: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ completed }) => {
  return (
    <Badge variant={completed ? 'success' : 'neutral'}>
      {completed ? 'COMPLETED' : 'PENDING'}
    </Badge>
  );
};