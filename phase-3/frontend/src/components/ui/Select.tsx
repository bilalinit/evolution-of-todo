/**
 * Select Component
 * Modern Technical Editorial Design System
 */

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, disabled, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={`w-full bg-[#F9F7F2] border border-[#2A1B12]/20 p-3 font-mono text-sm focus:border-[#FF6B4A] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed appearance-none ${icon ? 'pl-10' : 'pl-3'}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C4D45]">
              {icon}
            </div>
          )}
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <ChevronDown className="w-4 h-4 opacity-60" strokeWidth={1.5} />
          </div>
        </div>
        {error && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';