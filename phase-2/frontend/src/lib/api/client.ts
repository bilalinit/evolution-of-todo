/**
 * API Client
 *
 * Base HTTP client for all API requests.
 * Provides authentication, error handling, and request configuration.
 * Based on the specification in specs/003-nextjs-frontend/contracts/rest-api.md
 */

import { ApiError, ApiErrorResponse, ApiRequestConfig } from '@/types/api';

export class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  /**
   * Set the authentication token
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Clear the authentication token
   */
  clearToken() {
    this.token = null;
  }

  /**
   * Make a generic HTTP request
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as unknown as T;
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        const errorData = data as ApiErrorResponse;
        throw new ApiError(
          errorData.error.code,
          errorData.error.message,
          errorData.error.details
        );
      }

      return data as T;
    } catch (error) {
      // Handle network errors
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        'NETWORK_ERROR',
        'Network error occurred. Please check your connection.',
        { originalError: error }
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...config,
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...config,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...config,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...config,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...config,
    });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
);

export default apiClient;