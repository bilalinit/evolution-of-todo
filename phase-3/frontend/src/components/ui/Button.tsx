/**
 * Button Component
 * Modern Technical Editorial Design System
 */

"use client";

import * as React from "react";
import { LoadingSpinner } from "./LoadingSpinner";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "default" | "lg";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "default",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Primary Pill (Editorial Style) - Soft, for main CTAs
    const primaryClasses = `
      bg-[#FF6B4A] text-white rounded-full
      font-sans font-bold
      px-8 py-4
      hover:-translate-y-1 transition-transform
      shadow-lg shadow-[#FF6B4A]/20
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    `;

    // Technical Action (Sciemo Style) - Sharp corners, uppercase, technical
    const secondaryClasses = `
      border border-[#2A1B12] bg-transparent
      font-mono text-xs uppercase tracking-widest
      px-6 py-3
      hover:bg-[#2A1B12] hover:text-[#F9F7F2]
      transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const sizeClasses = {
      sm: "text-xs px-4 py-2",
      default: "text-sm",
      lg: "text-base",
    };

    const baseClasses = `
      inline-flex items-center justify-center
      focus:outline-none
      relative
      overflow-hidden
    `;

    const variantClasses = variant === "primary" ? primaryClasses : secondaryClasses;
    const finalSizeClasses = sizeClasses[size];

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${finalSizeClasses} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner
              size="sm"
              className={variant === "primary" ? "mr-2 text-white" : "mr-2"}
            />
            <span className={variant === "primary" ? "opacity-80" : "opacity-60"}>
              Loading...
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };