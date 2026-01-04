/**
 * Input Component
 * Modern Technical Editorial Design System
 */

"use client";

import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  error?: string;
  label?: string;
  as?: "input" | "textarea";
  rows?: number;
}

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className = "", error, label, as = "input", ...props }, ref) => {
    const baseClasses = `
      w-full bg-[#F9F7F2] border border-[#2A1B12]/20
      p-4 font-mono text-sm
      focus:border-[#FF6B4A] focus:outline-none transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const errorClasses = error ? "border-red-600 focus:border-red-600" : "";

    const Component = as === "textarea" ? "textarea" : "input";

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">
            {label}
            {props.required && <span className="text-[#FF6B4A] ml-1">*</span>}
          </label>
        )}
        <Component
          ref={ref as any}
          className={`${baseClasses} ${errorClasses} ${className}`}
          {...props}
        />
        {error && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };