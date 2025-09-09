import axios from 'axios';
import axiosRetry from 'axios-retry';
import store from '@/stores/store';
import { 
  handleApiError, 
  handleNetworkError, 
  handleRequestError, 
  handleUnknownError 
} from '@/lib/errors/errorHandler';
import { accessTokenAtom, refreshTokenAtom, updateTokensAtom, logoutAtom } from '@/stores/auth';
import { refreshTokens } from '@/lib/api/auth';
import type { ServiceError } from '@/lib/types/service-error';

// Create a store instance for accessing atoms outside React components


// Create base axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:5295/api/v1
  timeout: 5000, // 5 seconds
  withCredentials: true, // Important for session cookies in OAuth flow
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add retry logic to axios client
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay, // 1s, 2s, 4s
  retryCondition: (error) => {
    // Only retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           !!(error.response?.status && error.response.status >= 500);
  },
});

// Request interceptor - always add token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = store.get(accessTokenAtom);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track ongoing refresh to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

// Process queued requests after refresh completes
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor - enhanced with automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response) {
      const serviceError = error.response.data as ServiceError;
      
      if (error.response.status === 401 && !originalRequest._retry) {
        // Check if this is a login/register/refresh request - don't try to refresh for these
        const isAuthRequest = originalRequest.url?.includes('/auth/login') || 
                             originalRequest.url?.includes('/auth/register') ||
                             originalRequest.url?.includes('/auth/refresh') ||
                             originalRequest.url?.includes('/auth/google');
        
        if (isAuthRequest) {
          // For auth requests, just pass through the error - don't try to refresh
          if (serviceError?.errorCode) {
            handleApiError(serviceError, { 
              source: 'Axios Interceptor',
              context: 'Authentication request failed'
            });
          }
          return Promise.reject(error);
        }
        
        // Mark this request as retried to prevent infinite loops
        originalRequest._retry = true;
        
        const currentRefreshToken = store.get(refreshTokenAtom);
        
        if (!currentRefreshToken) {
          // No refresh token available - logout user and redirect to login
          store.set(logoutAtom);
          
          // Redirect to login page for authenticated routes
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          if (serviceError?.errorCode) {
            handleApiError(serviceError, { 
              source: 'Axios Interceptor',
              context: 'Authentication error - no refresh token, redirecting to login'
            });
          }
          return Promise.reject(error);
        }
        
        if (isRefreshing) {
          // Another request is already refreshing - queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }).catch((err) => {
            return Promise.reject(err);
          });
        }
        
        isRefreshing = true;
        
        try {
          // Attempt to refresh the token
          const newTokens = await refreshTokens(currentRefreshToken);
          
          // Update tokens in store
          store.set(updateTokensAtom, newTokens);
          
          // Process queued requests with new token
          processQueue(null, newTokens.AccessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.AccessToken}`;
          return apiClient(originalRequest);
          
        } catch (refreshError) {
          // Refresh failed - logout user and process queue with error
          processQueue(refreshError, null);
          store.set(logoutAtom);
          
          // Redirect to login page when refresh fails
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          handleApiError({
            errorCode: 'TOKEN_REFRESH_FAILED',
            message: 'Session expired. Please log in again.',
            details: null
          }, { 
            source: 'Axios Interceptor',
            context: 'Token refresh failed, redirecting to login'
          });
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (error.response.status === 404) {
        // Don't show error notifications for 404s - let components handle them gracefully
        // 404s are often expected (e.g., user doesn't have an address yet)
        return Promise.reject(error);
      } else if (serviceError?.errorCode) {
        handleApiError(serviceError, { 
          source: 'Axios Interceptor',
          context: `HTTP ${error.response.status} response`
        });
      } else {
        handleUnknownError(error.response, error.response.status, {
          source: 'Axios Interceptor',
          context: 'Non-ServiceError response format'
        });
      }
    } else if (error.request) {
      handleNetworkError({
        source: 'Axios Interceptor',
        context: 'No response from server'
      });
    } else {
      handleRequestError(error, {
        source: 'Axios Interceptor',
        context: 'Request configuration error'
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;