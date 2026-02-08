/**
 * Alert Component
 * Modern Technical Editorial Design System
 */

"use client";

import * as React from "react";

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }
>(({ className = "", variant = "default", ...props }, ref) => {
  const baseClasses = "relative w-full rounded-lg border p-4";
  const variants = {
    default: "bg-[#F9F7F2] border-[#2A1B12]/20",
    destructive: "bg-red-50 border-red-600 text-red-900",
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    />
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h5
    ref={ref}
    className={`font-serif font-bold text-[#2A1B12] mb-1 ${className}`}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`font-sans text-sm text-[#5C4D45] ${className}`}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };