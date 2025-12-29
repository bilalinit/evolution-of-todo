/**
 * TaskFilters Component
 *
 * Provides dropdown filters for task status, priority, and category.
 */

"use client";

import * as React from "react";
import { Filter, X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ActiveFilters } from "@/types/task";

interface TaskFiltersProps {
  filters: ActiveFilters;
  onFilterChange: (key: keyof ActiveFilters, value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export function TaskFilters({
  filters,
  onFilterChange,
  onClear,
  hasActiveFilters,
  className = "",
}: TaskFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'health', label: 'Health' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5C4D45]" strokeWidth={2} />
          <span className="font-mono text-xs uppercase tracking-widest text-[#5C4D45]">
            Filters
          </span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onClear}
            className="text-xs px-2 py-1 h-auto"
          >
            <X className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
          label="Status"
          options={statusOptions}
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
        />
        <Select
          label="Priority"
          options={priorityOptions}
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
        />
        <Select
          label="Category"
          options={categoryOptions}
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <div className="pt-2 border-t border-[#2A1B12]/10">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#5C4D45]">
            {`Active filters: ${[
              filters.status !== 'all' && `status: ${filters.status}`,
              filters.priority !== 'all' && `priority: ${filters.priority}`,
              filters.category !== 'all' && `category: ${filters.category}`,
            ].filter(Boolean).join(', ') || 'None'}`}
          </span>
        </div>
      )}
    </div>
  );
}