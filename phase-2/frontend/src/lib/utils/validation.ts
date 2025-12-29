/**
 * Validation Utility Functions
 *
 * Form validation schemas and helpers for the Todo application.
 */

import { CreateTaskFormData, UpdateTaskFormData } from '@/types/task';
import { LoginFormData, SignupFormData, PasswordChangeFormData, ProfileUpdateFormData } from '@/types/user';

/**
 * Task validation schema
 */
export const taskValidation = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
    messages: {
      required: "Title is required",
      minLength: "Title must be at least 1 character",
      maxLength: "Title must be 200 characters or less"
    }
  },
  description: {
    required: false,
    maxLength: 1000,
    messages: {
      maxLength: "Description must be 1000 characters or less"
    }
  },
  priority: {
    required: true,
    allowedValues: ['low', 'medium', 'high'],
    messages: {
      required: "Priority is required",
      invalid: "Priority must be low, medium, or high"
    }
  },
  category: {
    required: true,
    allowedValues: ['work', 'personal', 'shopping', 'health', 'other'],
    messages: {
      required: "Category is required",
      invalid: "Category must be work, personal, shopping, health, or other"
    }
  },
  due_date: {
    required: false,
    futureDate: true,
    messages: {
      futureDate: "Due date must be today or in the future"
    }
  }
};

/**
 * User validation schema
 */
export const userValidation = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    messages: {
      required: "Name is required",
      minLength: "Name must be at least 2 characters",
      maxLength: "Name must be 50 characters or less"
    }
  },
  email: {
    required: true,
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    messages: {
      required: "Email is required",
      pattern: "Please enter a valid email address"
    }
  },
  password: {
    required: true,
    minLength: 8,
    messages: {
      required: "Password is required",
      minLength: "Password must be at least 8 characters"
    }
  },
  confirm_password: {
    required: true,
    mustMatch: "password",
    messages: {
      required: "Please confirm your password",
      mustMatch: "Passwords do not match"
    }
  }
};

/**
 * Validate task form data
 */
export function validateTaskForm(data: CreateTaskFormData | UpdateTaskFormData): {
  isValid: boolean;
  errors: Partial<Record<keyof typeof taskValidation, string>>;
} {
  const errors: Partial<Record<keyof typeof taskValidation, string>> = {};

  // Title validation
  if (taskValidation.title.required && !data.title.trim()) {
    errors.title = taskValidation.title.messages.required;
  } else if (data.title.length < taskValidation.title.minLength) {
    errors.title = taskValidation.title.messages.minLength;
  } else if (data.title.length > taskValidation.title.maxLength) {
    errors.title = taskValidation.title.messages.maxLength;
  }

  // Description validation
  if (data.description && data.description.length > taskValidation.description.maxLength) {
    errors.description = taskValidation.description.messages.maxLength;
  }

  // Priority validation
  if (taskValidation.priority.required && !data.priority) {
    errors.priority = taskValidation.priority.messages.required;
  } else if (!taskValidation.priority.allowedValues.includes(data.priority)) {
    errors.priority = taskValidation.priority.messages.invalid;
  }

  // Category validation
  if (taskValidation.category.required && !data.category) {
    errors.category = taskValidation.category.messages.required;
  } else if (!taskValidation.category.allowedValues.includes(data.category)) {
    errors.category = taskValidation.category.messages.invalid;
  }

  // Due date validation
  if (data.due_date) {
    const selectedDate = new Date(data.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.due_date = taskValidation.due_date.messages.futureDate;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate login form data
 */
export function validateLoginForm(data: LoginFormData): {
  isValid: boolean;
  errors: Partial<Record<keyof typeof userValidation, string>>;
} {
  const errors: Partial<Record<keyof typeof userValidation, string>> = {};

  // Email validation
  if (userValidation.email.required && !data.email.trim()) {
    errors.email = userValidation.email.messages.required;
  } else if (!userValidation.email.pattern.test(data.email)) {
    errors.email = userValidation.email.messages.pattern;
  }

  // Password validation
  if (userValidation.password.required && !data.password) {
    errors.password = userValidation.password.messages.required;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate signup form data
 */
export function validateSignupForm(data: SignupFormData): {
  isValid: boolean;
  errors: Partial<Record<keyof typeof userValidation, string>>;
} {
  const errors: Partial<Record<keyof typeof userValidation, string>> = {};

  // Name validation
  if (userValidation.name.required && !data.name.trim()) {
    errors.name = userValidation.name.messages.required;
  } else if (data.name.length < userValidation.name.minLength) {
    errors.name = userValidation.name.messages.minLength;
  } else if (data.name.length > userValidation.name.maxLength) {
    errors.name = userValidation.name.messages.maxLength;
  }

  // Email validation
  if (userValidation.email.required && !data.email.trim()) {
    errors.email = userValidation.email.messages.required;
  } else if (!userValidation.email.pattern.test(data.email)) {
    errors.email = userValidation.email.messages.pattern;
  }

  // Password validation
  if (userValidation.password.required && !data.password) {
    errors.password = userValidation.password.messages.required;
  } else if (data.password.length < userValidation.password.minLength) {
    errors.password = userValidation.password.messages.minLength;
  }

  // Confirm password validation
  if (userValidation.confirm_password.required && !data.confirm_password) {
    errors.confirm_password = userValidation.confirm_password.messages.required;
  } else if (data.password !== data.confirm_password) {
    errors.confirm_password = userValidation.confirm_password.messages.mustMatch;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate profile update form data
 */
export function validateProfileForm(data: ProfileUpdateFormData): {
  isValid: boolean;
  errors: Partial<Record<keyof typeof userValidation, string>>;
} {
  const errors: Partial<Record<keyof typeof userValidation, string>> = {};

  // Name validation
  if (userValidation.name.required && !data.name.trim()) {
    errors.name = userValidation.name.messages.required;
  } else if (data.name.length < userValidation.name.minLength) {
    errors.name = userValidation.name.messages.minLength;
  } else if (data.name.length > userValidation.name.maxLength) {
    errors.name = userValidation.name.messages.maxLength;
  }

  // Email validation (if editable)
  if (data.email) {
    if (!userValidation.email.pattern.test(data.email)) {
      errors.email = userValidation.email.messages.pattern;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate password change form data
 */
export function validatePasswordChangeForm(data: PasswordChangeFormData): {
  isValid: boolean;
  errors: Partial<Record<'current_password' | 'new_password' | 'confirm_password', string>>;
} {
  const errors: Partial<Record<'current_password' | 'new_password' | 'confirm_password', string>> = {};

  // Current password validation
  if (!data.current_password) {
    errors.current_password = "Current password is required";
  }

  // New password validation
  if (!data.new_password) {
    errors.new_password = userValidation.password.messages.required;
  } else if (data.new_password.length < userValidation.password.minLength) {
    errors.new_password = userValidation.password.messages.minLength;
  }

  // Confirm password validation
  if (!data.confirm_password) {
    errors.confirm_password = userValidation.confirm_password.messages.required;
  } else if (data.new_password !== data.confirm_password) {
    errors.confirm_password = userValidation.confirm_password.messages.mustMatch;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return userValidation.email.pattern.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}