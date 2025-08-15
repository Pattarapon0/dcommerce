import axios from 'axios';
import axiosRetry from 'axios-retry';
import store from '@/lib/stores/store';
import { 
  handleApiError, 
  handleNetworkError, 
  handleRequestError, 
  handleUnknownError 
} from '@/lib/errors/errorHandler';
import { accessTokenAtom } from '@/lib/stores/auth';
import type { components } from '@/lib/types/api';

type ServiceError = components["schemas"]["ServiceError"];

// Create a store instance for accessing atoms outside React components


// Create base axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:5295/api/v1
  timeout: 5000, // 5 seconds
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
    console.log('🔑 Adding token to request:', token ? 'present' : 'none');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - enhanced with toast error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🚨 Axios interceptor caught error:', {
      hasResponse: !!error.response,
      hasRequest: !!error.request,
      status: error.response?.status,
      message: error.message
    });

    if (error.response) {
      // Server responded with error status
      const serviceError = error.response.data as ServiceError;
      console.log('🔍 ServiceError details:', error.response);
      
      // Handle 401 authentication errors - let auth store handle token refresh/logout
      if (error.response.status === 401) {
        console.log('🔄 401 error detected - auth store will handle token refresh');
        // Don't manually clear tokens here - let the auth store's auto-refresh handle it
        
        if (serviceError?.ErrorCode) {
          handleApiError(serviceError, { 
            source: 'Axios Interceptor',
            context: 'Authentication error'
          });
        }
      } else if (serviceError?.ErrorCode) {
        // Handle other ServiceErrors with our new system
        handleApiError(serviceError, { 
          source: 'Axios Interceptor',
          context: `HTTP ${error.response.status} response`
        });
      } else {
        // Handle non-ServiceError responses (unexpected format)
        handleUnknownError(error.response, error.response.status, {
          source: 'Axios Interceptor',
          context: 'Non-ServiceError response format'
        });
      }
    } else if (error.request) {
      // Network error (no response received)
      handleNetworkError({
        source: 'Axios Interceptor',
        context: 'No response from server'
      });
    } else {
      // Request setup error
      handleRequestError(error, {
        source: 'Axios Interceptor',
        context: 'Request configuration error'
      });
    }
    
    // Always reject so components can still catch and handle errors if needed
    return Promise.reject(error);
  }
);

export default apiClient;