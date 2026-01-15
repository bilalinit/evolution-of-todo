/**
 * PriorityBadge Component
 * Modern Technical Editorial Design System
 */

import * as React from 'react';
import { Badge } from '@/components/ui/Badge';

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