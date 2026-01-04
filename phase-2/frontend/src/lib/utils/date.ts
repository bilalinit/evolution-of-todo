/**
 * Date Utility Functions
 *
 * Date formatting and manipulation utilities for the Todo application.
 */

/**
 * Format date to readable string (e.g., "Dec 29, 2025")
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format date to short format (e.g., "12/29/2025")
 */
export function formatShortDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US");
}

/**
 * Format date for input[type="date"] (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string | number): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format time to readable string (e.g., "2:30 PM")
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date | string | number): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Get relative time string (e.g., "2 hours ago", "yesterday", "3 days ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  // Backend sends UTC timestamps without 'Z' suffix, so we need to handle this
  let dateStr = typeof date === 'string' ? date : String(date);

  // If it's a string without timezone info (no Z or +/-), treat as UTC
  if (typeof date === 'string' && !date.endsWith('Z') && !date.match(/[+-]\d{2}:\d{2}$/)) {
    dateStr = date + 'Z';
  }

  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return formatDate(date);
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string | number): boolean {
  return new Date(date).getTime() > Date.now();
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string | number): boolean {
  return new Date(date).getTime() < Date.now();
}

/**
 * Get days until date
 */
export function getDaysUntil(date: Date | string | number): number {
  const d = new Date(date);
  const today = new Date();
  const diffTime = d.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to date
 */
export function addDays(date: Date | string | number, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Format duration between two dates (e.g., "2 days", "3 hours")
 */
export function formatDuration(
  start: Date | string | number,
  end: Date | string | number
): string {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const diffMs = Math.abs(endTime - startTime);

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  return "just now";
}