/**
 * EmptyState Component
 * Modern Technical Editorial Design System
 * Displays empty state for tasks
 */

import * as React from 'react';
import { Plus, Search, ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-tasks' | 'no-results';
  searchQuery?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-tasks',
  searchQuery
}) => {
  const config = {
    'no-tasks': {
      icon: <ClipboardList className="w-12 h-12 text-[#2A1B12]/30" strokeWidth={1.5} />,
      title: "No Tasks Yet",
      description: "Start by creating your first task. Stay organized and productive!",
      action: "Create Task",
      showAction: true,
    },
    'no-results': {
      icon: <Search className="w-12 h-12 text-[#2A1B12]/30" strokeWidth={1.5} />,
      title: "No Results Found",
      description: searchQuery
        ? `No tasks match "${searchQuery}". Try a different search term.`
        : "No tasks match your current filters.",
      action: "Clear Filters",
      showAction: true,
    },
  };

  const currentConfig = config[type];

  return (
    <div className="border border-[#2A1B12]/20 bg-[#F9F7F2] rounded-lg p-8 text-center">
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        {/* Icon */}
        <div className="p-4 bg-[#2A1B12]/5 rounded-full">
          {currentConfig.icon}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-[#2A1B12]">
            {currentConfig.title}
          </h3>
          <p className="font-sans text-sm text-[#5C4D45]">
            {currentConfig.description}
          </p>
        </div>

        {/* Action */}
        {currentConfig.showAction && (
          <div className="pt-2">
            <button className="
              inline-flex items-center gap-2
              px-6 py-3
              border border-[#2A1B12]
              font-mono text-xs uppercase tracking-widest
              text-[#2A1B12] bg-transparent
              hover:bg-[#2A1B12] hover:text-[#F9F7F2]
              transition-colors
            ">
              <Plus className="w-4 h-4" strokeWidth={2} />
              {currentConfig.action}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};