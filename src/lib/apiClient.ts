/**
 * API Client for Express Backend
 *
 * This client handles all HTTP requests to the Express backend.
 * It includes authentication token handling via Supabase.
 */

import { supabase } from '@/lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Get auth token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
    return data.session?.access_token ?? null;
  } catch (err) {
    console.error('Unexpected error getting auth token:', err);
    return null;
  }
}

/**
 * Build headers for API requests
 */
async function buildHeaders(includeAuth = true): Promise<HeadersInit> {
  const headers: HeadersInit = {};

  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/** Default request timeout: 30 seconds */
const DEFAULT_TIMEOUT = 30_000;

/** Extra options beyond standard RequestInit */
interface ApiFetchOptions extends RequestInit {
  /** Request timeout in milliseconds. Defaults to 30 000ms. */
  timeout?: number;
}

/**
 * Generic fetch wrapper with error handling and timeout support
 */
async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${API_URL}${endpoint}`;
    const headers = await buildHeaders();

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        // Try to refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Session refresh failed:', refreshError);
        }
      }

      return {
        success: false,
        error: {
          message: data.message || 'An error occurred',
          status: response.status,
          details: data,
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    // Provide a clear message for timeout vs generic network errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        error: {
          message: 'Request timed out. The server is still processing — please check back shortly.',
          status: 0,
          details: error,
        },
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
        details: error,
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * POST request with JSON body
 */
export async function post<T>(
  endpoint: string,
  body: unknown,
  options?: { timeout?: number }
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * POST request with FormData (for file uploads)
 */
export async function postFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    // Don't set Content-Type - browser will set it with boundary
    body: formData,
  });
}

/**
 * GET request
 */
export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'GET',
  });
}

/**
 * PUT request with JSON body
 */
export async function put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'DELETE',
  });
}

/**
 * PATCH request with JSON body
 */
export async function patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del,
  postFormData,
};
