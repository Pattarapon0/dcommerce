import axios from 'axios';
import { 
  handleApiError, 
  handleNetworkError, 
  handleRequestError, 
  handleUnknownError 
} from '@/lib/errors/errorHandler';
import { shouldRedirectToLogin } from '@/lib/errors/errorClassifier';
import type { components } from '@/lib/types/api';

type ServiceError = components["schemas"]["ServiceError"];

// Create base axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:5295/api/v1
  timeout: 5000, // 5 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - always add token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
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
      
      // Handle 401 authentication errors (keep existing logic but enhance)
      if (error.response.status === 401) {
        // Check if it's a token-related error that should redirect
        if (serviceError && shouldRedirectToLogin(serviceError)) {
          console.log('🔄 Redirecting to login due to auth error:', serviceError.ErrorCode);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // For other 401 errors, let the error handler decide (some might be form validation)
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