/**
 * String and Data Formatters
 *
 * Utility functions for formatting strings, dates, and other data types.
 */

/**
 * Format text to title case
 * Converts "hello world" to "Hello World"
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  );
}

/**
 * Format text to sentence case
 * Converts "HELLO WORLD" to "Hello world"
 */
export function toSentenceCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Format number with commas
 * Converts 1000 to "1,000"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format currency
 * Converts 1234.56 to "$1,234.56"
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Truncate text with ellipsis
 * Limits text to maxLength characters and adds "..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Slugify string
 * Converts "Hello World!" to "hello-world"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format bytes to human readable string
 * Converts 1024 to "1 KB"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Capitalize first letter
 * Converts "hello" to "Hello"
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Remove all whitespace
 * Converts "  hello  world  " to "helloworld"
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, '');
}

/**
 * Format phone number
 * Converts 1234567890 to "(123) 456-7890"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Generate initials from name
 * Converts "John Doe" to "JD"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Pluralize word
 * Pluralizes "item" based on count
 */
export function pluralize(word: string, count: number): string {
  if (count === 1) return word;
  return word + 's';
}

/**
 * Format array as comma-separated string
 * Converts ["a", "b", "c"] to "a, b, and c"
 */
export function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  const allButLast = items.slice(0, -1);
  const last = items[items.length - 1];
  return `${allButLast.join(', ')}, and ${last}`;
}

/**
 * Escape HTML
 * Prevents XSS by escaping HTML characters
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": "'",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Strip HTML tags
 * Removes all HTML tags from string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Format duration
 * Converts seconds to "2h 30m" or "45m" format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Obfuscate email
 * Converts "john@example.com" to "j***@example.com"
 */
export function obfuscateEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;

  const obfuscatedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
  return `${obfuscatedLocal}@${domain}`;
}

/**
 * Format percentage
 * Converts 0.856 to "85.6%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Generate random string
 * Creates a random string of specified length
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format file size
 * Alternative to formatBytes with different naming
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

/**
 * Format URL
 * Ensures URL has protocol
 */
export function formatUrl(url: string): string {
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

/**
 * Remove diacritics
 * Removes accents from characters (é -> e)
 */
export function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Word count
 * Counts words in string
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Character count
 * Counts characters excluding whitespace
 */
export function charCount(str: string): number {
  return str.replace(/\s/g, '').length;
}