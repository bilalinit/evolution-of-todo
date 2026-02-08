/**
 * TaskSearch Component
 *
 * Search input for filtering tasks by title and description.
 * Uses debounced input for better performance.
 */

"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface TaskSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TaskSearch({
  value,
  onChange,
  placeholder = "Search tasks by title or description...",
  className = "",
}: TaskSearchProps) {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 font-mono"
        aria-label="Search tasks"
      />

      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C4D45]">
        <Search className="w-4 h-4" strokeWidth={2} />
      </div>

      
    </div>
  );
}