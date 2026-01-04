/**
 * CategoryBadge Component
 * Modern Technical Editorial Design System
 */

import * as React from 'react';
import { Badge } from '@/components/ui/Badge';

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