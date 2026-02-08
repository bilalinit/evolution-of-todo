/**
 * ChatKit session management utilities.
 * Handles session creation and refresh with authentication.
 */

import { IS_DEVELOPMENT } from '@/lib/constants';

export async function createChatKitSession(): Promise<{
  client_secret: string;
  session_id: string;
  user_id: string;
  expires_at: string;
}> {
  if (IS_DEVELOPMENT) {
    console.log('createChatKitSession: Starting session creation...');
  }
  const startTime = Date.now();

  try {
    if (IS_DEVELOPMENT) {
      console.log('createChatKitSession: About to fetch /api/chatkit/session');
    }
    const response = await fetch('/api/chatkit/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // For httpOnly cookies
    });

    // Security: Don't log response data or headers

    if (!response.ok) {
      if (IS_DEVELOPMENT) {
        console.log('createChatKitSession: Response not OK');
      }
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create session');
    }

    if (IS_DEVELOPMENT) {
      console.log('createChatKitSession: Response OK, parsing JSON...');
    }
    const result = await response.json();
    if (IS_DEVELOPMENT) {
      console.log('createChatKitSession: Success!');
    }
    return result;
  } catch (error) {
    console.error('createChatKitSession: Exception caught:', {
      error,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

export async function refreshChatKitSession(currentToken: string): Promise<{
  client_secret: string;
  session_id: string;
  user_id: string;
  expires_at: string;
}> {
  const response = await fetch('/api/chatkit/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ current_token: currentToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to refresh session');
  }

  return response.json();
}

/**
 * Get current page context for personalization
 */
export function getPageContext(): Record<string, any> {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    url: window.location.href,
    pathname: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get user info from auth state
 */
export async function getUserInfo(): Promise<Record<string, any> | null> {
  try {
    // Use Better Auth session endpoint
    const response = await fetch('/api/auth/get-session', {
      credentials: 'include',
    });

    if (response.ok) {
      const session = await response.json();
      return session.user || null;
    }
  } catch (error) {
    console.warn('Could not fetch user info:', error);
  }

  return null;
}

/**
 * Enhanced fetch with auth headers for ChatKit
 */
export async function chatkitFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const enhancedOptions = {
    ...options,
    credentials: 'include' as const,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  };

  return fetch(url, enhancedOptions);
}