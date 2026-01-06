/**
 * Validation Utilities
 *
 * Validation functions for forms, inputs, and data integrity.
 */

/**
 * Email validation
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email.trim());
}

/**
 * Password strength validation
 * Checks password meets security requirements
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Required field validation
 * Checks if field is not empty
 */
export function validateRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Minimum length validation
 * Checks if string meets minimum length
 */
export function validateMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Maximum length validation
 * Checks if string doesn't exceed maximum length
 */
export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Phone number validation
 * Validates US phone number format
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * URL validation
 * Validates URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Number validation
 * Checks if value is a valid number
 */
export function validateNumber(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
}

/**
 * Integer validation
 * Checks if value is a valid integer
 */
export function validateInteger(value: string): boolean {
  return Number.isInteger(Number(value)) && /^-?\d+$/.test(value);
}

/**
 * Positive number validation
 * Checks if value is a positive number
 */
export function validatePositiveNumber(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Date validation
 * Validates if string is a valid date
 */
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Future date validation
 * Checks if date is in the future
 */
export function validateFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}

/**
 * Past date validation
 * Checks if date is in the past
 */
export function validatePastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
}

/**
 * Username validation
 * Validates username format (alphanumeric, underscores, hyphens)
 */
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * ZIP code validation
 * Validates US ZIP code format
 */
export function validateZipCode(zip: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

/**
 * Credit card validation (Luhn algorithm)
 * Validates credit card number
 */
export function validateCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * ISBN validation
 * Validates ISBN-10 or ISBN-13 format
 */
export function validateIsbn(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, '');

  // ISBN-10
  if (/^\d{9}[\dX]$/.test(cleaned)) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i);
    }
    const checkDigit = cleaned[9] === 'X' ? 10 : parseInt(cleaned[9]);
    sum += checkDigit;
    return sum % 11 === 0;
  }

  // ISBN-13
  if (/^\d{13}$/.test(cleaned)) {
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      const digit = parseInt(cleaned[i]);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    return sum % 10 === 0;
  }

  return false;
}

/**
 * Hex color validation
 * Validates hex color code (#FFF or #FFFFFF)
 */
export function validateHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * File type validation
 * Validates file extension
 */
export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * File size validation
 * Validates file size in bytes
 */
export function validateFileSize(fileSize: number, maxSize: number): boolean {
  return fileSize <= maxSize;
}

/**
 * Match validation
 * Checks if two values match
 */
export function validateMatch(value1: string, value2: string): boolean {
  return value1 === value2;
}

/**
 * Array length validation
 * Checks if array meets length requirements
 */
export function validateArrayLength(array: any[], min?: number, max?: number): boolean {
  if (min !== undefined && array.length < min) return false;
  if (max !== undefined && array.length > max) return false;
  return true;
}

/**
 * Object validation
 * Validates that object has required properties
 */
export function validateObject(obj: any, requiredKeys: string[]): boolean {
  return requiredKeys.every(key => key in obj && obj[key] !== undefined && obj[key] !== null);
}

/**
 * Email or username validation
 * Validates if input is either email or valid username
 */
export function validateEmailOrUsername(input: string): boolean {
  return validateEmail(input) || validateUsername(input);
}

/**
 * Strong password validation
 * Strict password requirements
 */
export function validateStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common patterns
  if (/^(password|123456|qwerty|letmein)/i.test(password)) {
    errors.push('Password is too common');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * IBAN validation
 * Validates International Bank Account Number
 */
export function validateIban(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();

  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleaned)) {
    return false;
  }

  const moved = cleaned.slice(4) + cleaned.slice(0, 4);
  const digits = moved.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString());

  let remainder = 0;
  for (let i = 0; i < digits.length; i++) {
    remainder = (remainder * 10 + parseInt(digits[i])) % 97;
  }

  return remainder === 1;
}

/**
 * BIC/SWIFT code validation
 * Validates Bank Identifier Code
 */
export function validateBic(bic: string): boolean {
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic);
}

/**
 * UUID validation
 * Validates UUID format
 */
export function validateUuid(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Base64 validation
 * Validates Base64 encoded string
 */
export function validateBase64(str: string): boolean {
  return /^[A-Za-z0-9+/]*={0,2}$/.test(str) && str.length % 4 === 0;
}

/**
 * JSON validation
 * Validates if string is valid JSON
 */
export function validateJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Email disposable validation
 * Checks if email is from disposable email service
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    'tempmail.com', 'guerrillamail.com', 'mailinator.com',
    '10minutemail.com', 'throwawaymail.com', 'fakeinbox.com'
  ];

  const domain = email.split('@')[1];
  return disposableDomains.includes(domain);
}

/**
 * Password match validation
 * Validates password confirmation
 */
export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Username availability validation
 * Checks if username meets availability criteria
 */
export function validateUsernameAvailability(username: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (username.length > 20) {
    errors.push('Username must be 20 characters or less');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }

  if (/^(admin|root|superuser|moderator|test|demo)/i.test(username)) {
    errors.push('Username is reserved');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Tax ID validation (US EIN format)
 * Validates Employer Identification Number
 */
export function validateTaxId(taxId: string): boolean {
  const cleaned = taxId.replace(/\D/g, '');
  return /^(\d{2}-\d{7}|\d{9})$/.test(taxId) || cleaned.length === 9;
}

/**
 * SSN validation (US Social Security Number)
 * Validates SSN format (not for production use in real apps)
 */
export function validateSsn(ssn: string): boolean {
  const cleaned = ssn.replace(/\D/g, '');

  if (cleaned.length !== 9) return false;

  // Check for invalid SSN patterns
  if (/^000|666|900/.test(cleaned.substring(0, 3))) return false;
  if (/^00$/.test(cleaned.substring(3, 5))) return false;
  if (/^0000$/.test(cleaned.substring(5, 9))) return false;

  return true;
}

/**
 * VIN validation (Vehicle Identification Number)
 * Validates VIN format
 */
export function validateVin(vin: string): boolean {
  const cleaned = vin.toUpperCase();

  if (cleaned.length !== 17) return false;
  if (/[IOQ]/.test(cleaned)) return false;

  // Simple checksum validation
  const map = '0123456789X';
  const weights = '876543210123456789';
  let sum = 0;

  for (let i = 0; i < 17; i++) {
    const char = cleaned[i];
    const digit = map.indexOf(char);
    if (digit === -1) return false;
    sum += digit * parseInt(weights[i]);
  }

  const checkDigit = sum % 11;
  return checkDigit === 10 ? cleaned[8] === 'X' : checkDigit === parseInt(cleaned[8]);
}

/**
 * Domain name validation
 * Validates domain name format
 */
export function validateDomain(domain: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(domain);
}

/**
 * Time validation
 * Validates time format (HH:MM or HH:MM:SS)
 */
export function validateTime(time: string): boolean {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(time);
}

/**
 * Color validation
 * Validates color in various formats
 */
export function validateColor(color: string): boolean {
  return validateHexColor(color) ||
         /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/.test(color) ||
         /^rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*(0|1|0\.\d+)\)$/.test(color) ||
         /^[a-z]+$/.test(color); // Named colors
}

/**
 * Postal code validation (international)
 * Validates postal codes from various countries
 */
export function validatePostalCode(postalCode: string, country: string = 'US'): boolean {
  const patterns: { [key: string]: RegExp } = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/,
    AU: /^\d{4}$/,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
  };

  const pattern = patterns[country];
  return pattern ? pattern.test(postalCode) : postalCode.length > 0;
}

/**
 * IBAN country code validation
 * Validates IBAN country codes
 */
export function validateIbanCountry(countryCode: string): boolean {
  const validCountries = [
    'AL', 'AD', 'AT', 'AZ', 'BH', 'BY', 'BE', 'BA', 'BR', 'BG',
    'CR', 'HR', 'CY', 'CZ', 'DK', 'DO', 'EE', 'FO', 'FI', 'FR',
    'GE', 'DE', 'GI', 'GR', 'HU', 'IS', 'IE', 'IL', 'IT', 'JO',
    'KZ', 'KW', 'LV', 'LB', 'LI', 'LT', 'LU', 'MT', 'MD', 'MC',
    'ME', 'NL', 'MK', 'NO', 'PK', 'PS', 'PL', 'PT', 'QA', 'RO',
    'RU', 'SM', 'SA', 'RS', 'SK', 'SI', 'ES', 'SE', 'CH', 'TN',
    'TR', 'UA', 'GB', 'VG'
  ];

  return validCountries.includes(countryCode.toUpperCase());
}

/**
 * MAC address validation
 * Validates MAC address format
 */
export function validateMacAddress(mac: string): boolean {
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac) ||
         /^([0-9A-Fa-f]{4}\.){2}([0-9A-Fa-f]{4})$/.test(mac);
}

/**
 * IP address validation
 * Validates IPv4 or IPv6 address
 */
export function validateIpAddress(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Semantic version validation
 * Validates semantic versioning (X.Y.Z)
 */
export function validateSemanticVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/.test(version);
}

/**
 * Color contrast validation
 * Validates if two colors have sufficient contrast
 */
export function validateColorContrast(color1: string, color2: string): boolean {
  // Simplified contrast ratio calculation
  // In production, use a proper library for WCAG compliance
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  if (!validateHexColor(color1) || !validateHexColor(color2)) {
    return false;
  }

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

  return ratio >= 4.5; // WCAG AA standard for normal text
}