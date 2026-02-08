/**
 * TagBadge Component
 * Modern Technical Editorial Design System
 * Displays tags as colored pills
 */

import * as React from 'react';

interface TagBadgeProps {
  tag: string;
  className?: string;
}

// Generate consistent colors based on tag string
const getTagColor = (tag: string): string => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-teal-100 text-teal-800 border-teal-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200',
  ];

  // Simple hash function to get consistent index
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, className = '' }) => {
  const colorClass = getTagColor(tag);

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-md
        font-mono text-[10px] uppercase tracking-wider
        border ${colorClass}
        ${className}
      `}
    >
      #{tag}
    </span>
  );
};
