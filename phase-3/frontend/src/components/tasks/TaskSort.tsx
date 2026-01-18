/**
 * TaskSort Component
 *
 * Provides dropdown for sorting tasks by various criteria.
 */

"use client";

import * as React from "react";
import { ArrowUpDown } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { SortConfig } from "@/types/task";

interface TaskSortProps {
  sortConfig: SortConfig;
  onSortChange: (field: SortConfig['field'], order: SortConfig['order']) => void;
  className?: string;
}

export function TaskSort({
  sortConfig,
  onSortChange,
  className = "",
}: TaskSortProps) {
  const sortOptions = [
    { value: 'created_at-desc', label: 'Newest First' },
    { value: 'created_at-asc', label: 'Oldest First' },
    { value: 'due_date-asc', label: 'Due Date (Soonest)' },
    { value: 'due_date-desc', label: 'Due Date (Latest)' },
    { value: 'priority-desc', label: 'Priority (High to Low)' },
    { value: 'priority-asc', label: 'Priority (Low to High)' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
  ];

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-') as [SortConfig['field'], SortConfig['order']];
    onSortChange(field, order);
  };

  const currentValue = `${sortConfig.field}-${sortConfig.order}`;

  return (
    <div className={`flex flex-col justify-end ${className}`}>
      <Select
        label="Sort By"
        options={sortOptions}
        value={currentValue}
        onChange={(e) => handleSortChange(e.target.value)}
        icon={<ArrowUpDown className="w-4 h-4" strokeWidth={2} />}
      />
    </div>
  );
}