/**
 * Supabase client initialization for frontend.
 * Handles all authentication and database operations.
 */
import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment variables'
  );
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function notifyAuthChanged() {
  window.dispatchEvent(new Event('auth-changed'));
}

async function parseErrorResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const error = await response.json();
    return error.error || error.message || fallbackMessage;
  }

  const text = await response.text();
  if (text && text.toLowerCase().includes('<!doctype')) {
    return `${fallbackMessage} (server returned HTML error page)`;
  }

  return fallbackMessage;
}

/**
 * Authentication service class
 */
export class AuthService {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user, session}>}
   */
  static async register(email, password) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user, session}>}
   */
  static async login(email, password) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens in localStorage
      if (data.session?.access_token) {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        notifyAuthChanged();
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/logout/`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
        }
      );

      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      notifyAuthChanged();

      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear even if request fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      notifyAuthChanged();
    }
  }

  /**
   * Get current user from local storage
   * @returns {object|null}
   */
  static getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Get access token
   * @returns {string|null}
   */
  static getAccessToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{access_token, refresh_token}>}
   */
  static async refreshToken(refreshToken) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/refresh/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      if (data.session?.access_token) {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
        notifyAuthChanged();
      }

      return data.session;
    } catch (error) {
      // Clear tokens if refresh fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  }

  /**
   * Get authorization headers with Bearer token
   * @returns {object}
   */
  static getAuthHeaders() {
    const token = this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
}

/**
 * Scan service - handles scan operations
 */
export class ScanService {
  /**
   * Start a new scan
   * @param {string} repoUrl - GitHub repository URL
   * @returns {Promise<{scan_id, status}>}
   */
  static async startScan(repoUrl) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/scan/`,
        {
          method: 'POST',
          headers: AuthService.getAuthHeaders(),
          body: JSON.stringify({ repo_url: repoUrl }),
        }
      );

      if (!response.ok) {
        const message = await parseErrorResponse(response, 'Failed to start scan');
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get scan status
   * @param {string} scanId - Scan ID
   * @returns {Promise<object>}
   */
  static async getScanStatus(scanId) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/scan-status/${scanId}/`,
        {
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get scan status');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all scan reports for user
   * @param {number} limit - Max number of reports
   * @returns {Promise<array>}
   */
  static async getReports(limit = 50) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/?limit=${limit}`,
        {
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get reports');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get specific report
   * @param {string} reportId - Report ID
   * @returns {Promise<object>}
   */
  static async getReport(reportId) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/${reportId}/`,
        {
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get report');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Search history service
 */
export class HistoryService {
  /**
   * Get search history
   * @param {number} limit - Max number of entries (default 10)
   * @returns {Promise<array>}
   */
  static async getHistory(limit = 10) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/history/?limit=${limit}`,
        {
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const message = await parseErrorResponse(response, 'Failed to get search history');
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete search history entry
   * @param {string} entryId - History entry ID
   * @returns {Promise<object>}
   */
  static async deleteEntry(entryId) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/history/${entryId}/`,
        {
          method: 'DELETE',
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete history entry');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear all search history
   * @returns {Promise<object>}
   */
  static async clearHistory() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/history/`,
        {
          method: 'DELETE',
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to clear search history');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default supabase;
