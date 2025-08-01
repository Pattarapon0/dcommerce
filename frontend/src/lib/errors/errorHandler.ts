import { toast } from 'sonner';
import { classifyServiceError } from './errorClassifier';
import { getToastMessage, getToastTitle } from './errorMessages';
import type { components } from '@/lib/types/api';

type ServiceError = components["schemas"]["ServiceError"];

/**
 * Options for error handling behavior
 */
export interface ErrorHandlingOptions {
  /** Suppress toast notification for this error */
  suppressToast?: boolean;
  /** Additional context for logging */
  context?: string;
  /** Component or page where error occurred */
  source?: string;
  /** Whether to log the error (overrides default logic) */
  forceLog?: boolean;
}

/**
 * Main error handler for API errors
 * This is the central function called by the Axios interceptor and components
 * @param error ServiceError from the API
 * @param options Optional configuration for error handling
 */
export function handleApiError(
  error: ServiceError, 
  options: ErrorHandlingOptions = {}
): void {
  const classification = classifyServiceError(error);
  
  // Log error details for debugging
  console.log('🔥 API Error:', {
    errorCode: error.ErrorCode,
    message: error.Message,
    statusCode: error.StatusCode,
    category: error.Category,
    hasFieldErrors: error.HasFieldErrors,
    classification,
    source: options.source,
    context: options.context
  });

  // Handle toast display
  if (!options.suppressToast && classification.showAsToast) {
    console.log('📢 Showing error toast');
    const title = getToastTitle(error.Category ?? 'Error');
    const message = getToastMessage(error);
    
    // Use Sonner's toast function with appropriate variant
    if ((error.StatusCode ?? 500) >= 500 || error.Category === 'Authentication' || error.Category === 'Token') {
      toast.error(message, { description: title });
    } else {
      toast.warning(message, { description: title });
    }
  } else if (classification.showAsToast) {
    console.log('🔇 Toast suppressed by options');
  } else {
    console.log('📝 Skipping toast (form validation error or not suitable for toast)');
  }

  // Log error if needed
  if (options.forceLog || classification.shouldLog) {
    logError(error, options);
  }

  // Additional actions based on error type
  handleErrorSideEffects(error, classification, options);
}

/**
 * Handle side effects of errors (redirects, cleanup, etc.)
 * @param error ServiceError
 * @param classification Error classification
 * @param options Error handling options
 */
function handleErrorSideEffects(
  error: ServiceError,
  classification: ReturnType<typeof classifyServiceError>,
  _options: ErrorHandlingOptions
): void {
  // Authentication redirect is handled in Axios interceptor
  // to avoid circular dependencies and ensure it happens before other logic
  
  // Could add other side effects here:
  // - Clear cache on certain errors
  // - Trigger analytics events
  // - Update global loading states
  // - etc.
  
  if (classification.isCritical) {
    console.warn('⚠️ Critical error detected:', error.ErrorCode);
  }
  
  if (classification.shouldRedirect) {
    console.log('🔄 Error requires redirect (handled by Axios interceptor)');
  }
}

/**
 * Log error information for debugging and monitoring
 * @param error ServiceError
 * @param options Error handling options
 */
function logError(error: ServiceError, options: ErrorHandlingOptions): void {
  const logData = {
    timestamp: new Date().toISOString(),
    errorCode: error.ErrorCode,
    message: error.Message,
    statusCode: error.StatusCode,
    category: error.Category,
    hasFieldErrors: error.HasFieldErrors,
    source: options.source,
    context: options.context,
    // Don't log sensitive field data
    fieldCount: error.Errors ? Object.keys(error.Errors).length : 0,
  };

  if ((error.StatusCode ?? 500) >= 500) {
    console.error('🚨 Server Error:', logData);
  } else if (error.Category === 'Authentication' || error.Category === 'Token') {
    console.warn('🔐 Auth Error:', logData);
  } else {
    console.info('ℹ️ Client Error:', logData);
  }

  // In production, you would send this to your logging service:
  // logToService(logData);
}

/**
 * Show a success toast notification
 * @param message Success message to display
 * @param options Optional configuration
 */
export function showSuccessToast(
  message: string, 
  options: { context?: string; source?: string } = {}
): void {
  console.log('✅ Showing success toast:', {
    message,
    source: options.source,
    context: options.context
  });
  
  toast.success(message);
}

/**
 * Show a generic toast notification
 * @param title Toast title
 * @param message Toast message
 * @param variant Toast style variant
 * @param duration Duration in milliseconds
 */
export function showToast(
  title: string,
  message: string,
  variant: 'destructive' | 'default' | 'success' = 'default',
  duration: number = 6000
): void {
  console.log('📢 Showing generic toast:', {
    title,
    message,
    variant,
    duration
  });
  
  const options = { description: title, duration };
  
  switch (variant) {
    case 'destructive':
      toast.error(message, options);
      break;
    case 'success':
      toast.success(message, options);
      break;
    default:
      toast(message, options);
      break;
  }
}

/**
 * Handle network errors specifically
 * @param options Error handling options
 */
export function handleNetworkError(options: ErrorHandlingOptions = {}): void {
  const networkError: ServiceError = {
    ErrorCode: 'NETWORK_ERROR',
    Message: 'Unable to connect to server',
    StatusCode: 0,
    Category: 'General',
    HasFieldErrors: false,
    Errors: null,
    Code: 0,
    IsExpected: true,
    IsExceptional: false,
    IsClientError: false,
    IsbackendError: false,
    IsAuthenticationError: false,
  };

  handleApiError(networkError, {
    ...options,
    context: 'Network connection failed',
    source: options.source || 'Axios Interceptor'
  });
}

/**
 * Handle request setup errors specifically
 * @param error Original error object
 * @param options Error handling options
 */
export function handleRequestError(error: any, options: ErrorHandlingOptions = {}): void {
  const requestError: ServiceError = {
    ErrorCode: 'REQUEST_ERROR',
    Message: error.message || 'Failed to send request',
    StatusCode: 0,
    Category: 'General',
    HasFieldErrors: false,
    Errors: null,
    Code: 0,
    IsExpected: true,
    IsExceptional: false,
    IsClientError: false,
    IsbackendError: false,
    IsAuthenticationError: false,
  };

  handleApiError(requestError, {
    ...options,
    context: 'Request setup failed',
    source: options.source || 'Axios Interceptor'
  });
}

/**
 * Handle unknown errors that don't fit the ServiceError pattern
 * @param error Original error object
 * @param statusCode HTTP status code if available
 * @param options Error handling options
 */
export function handleUnknownError(
  error: any, 
  statusCode: number = 0, 
  options: ErrorHandlingOptions = {}
): void {
  const unknownError: ServiceError = {
    ErrorCode: 'UNKNOWN_ERROR',
    Message: error.message || `HTTP ${statusCode}: ${error.statusText || 'Unknown error'}`,
    StatusCode: statusCode,
    Category: 'General',
    HasFieldErrors: false,
    Errors: null,
    Code: statusCode,
    IsExpected: false,
    IsExceptional: true,
    IsClientError: statusCode >= 400 && statusCode < 500,
    IsbackendError: statusCode >= 500,
    IsAuthenticationError: statusCode === 401,
  };

  handleApiError(unknownError, {
    ...options,
    context: 'Unknown error format',
    forceLog: true, // Always log unknown errors
    source: options.source || 'Axios Interceptor'
  });
}

/**
 * Clear all toast notifications
 */
export function clearAllToasts(): void {
  console.log('🧹 Clearing all toasts');
  toast.dismiss();
}

/**
 * Get current toast count for debugging
 * @returns Number of toasts in queue (Sonner doesn't expose this, return 0)
 */
export function getToastCount(): number {
  return 0; // Sonner doesn't expose toast count
}

/**
 * Debug function to inspect current error handling state
 */
export function debugErrorHandling(): void {
  console.log('🔍 Error Handling Debug:');
  console.log('Using Sonner for toast notifications');
  console.log('Toast count not available with Sonner API');
}