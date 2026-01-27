/**
 * Checkbox Component
 * Modern Technical Editorial Design System
 */

import * as React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, disabled, checked, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-start gap-3">
          <div className="relative flex items-center justify-center">
            <input
              ref={ref}
              type="checkbox"
              className="peer absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              checked={checked}
              disabled={disabled}
              {...props}
            />
            <div className={`relative flex items-center justify-center w-5 h-5 border-2 transition-all duration-200 ${checked ? 'bg-[#FF6B4A] border-[#FF6B4A]' : 'bg-[#F9F7F2] border-[#2A1B12]/30 hover:border-[#FF6B4A]'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
              {checked && (
                <Check
                  className="w-3.5 h-3.5 text-white"
                  strokeWidth={3}
                />
              )}
            </div>
          </div>

          {label && (
            <label className={`text-sm font-medium text-[#2A1B12] select-none cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
              {label}
            </label>
          )}
        </div>

        {error && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-red-600 ml-8">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Checkbox Group Component
interface CheckboxGroupProps {
  options: Array<{
    value: string;
    label: string;
  }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  selectedValues,
  onChange
}) => {
  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <Checkbox
          key={option.value}
          label={option.label}
          checked={selectedValues.includes(option.value)}
          onChange={() => handleToggle(option.value)}
        />
      ))}
    </div>
  );
};