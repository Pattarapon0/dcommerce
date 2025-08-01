import {components } from '@/lib/types/api';

/**
 * Determines whether an error should be shown as a toast notification
 * @param error ServiceError from the API
 * @returns True if the error should be displayed as a toast
 */
type ServiceError = components["schemas"]["ServiceError"];
export function shouldShowAsToast(error: ServiceError): boolean {
  // Skip form validation errors - these should be handled inline in forms
  if (error.HasFieldErrors) {
    return false;
  }
  
  // Show all other errors as toasts
  return true;
}

/**
 * Determines if an error is a network-related error (no response from server)
 * @param error Axios error object
 * @returns True if it's a network error
 */
export function isNetworkError(error: any): boolean {
  return !error.response && error.request;
}

/**
 * Determines if an error is a request setup error (error before sending)
 * @param error Axios error object
 * @returns True if it's a request setup error
 */
export function isRequestError(error: any): boolean {
  return !error.response && !error.request;
}

/**
 * Determines if an error is a server error (5xx status codes)
 * @param error ServiceError from the API
 * @returns True if it's a server error
 */
export function isServerError(error: ServiceError): boolean {
  return (error.StatusCode ?? 500) >= 500;
}

/**
 * Determines if an error is a client error (4xx status codes)
 * @param error ServiceError from the API
 * @returns True if it's a client error
 */
export function isClientError(error: ServiceError): boolean {
  return (error.StatusCode ?? 500) >= 400 && (error.StatusCode ?? 500) < 500;
}

/**
 * Determines if an error is authentication-related
 * @param error ServiceError from the API
 * @returns True if it's an authentication error
 */
export function isAuthError(error: ServiceError): boolean {
  return error.Category === 'Authentication' || 
         error.Category === 'Token' ||
         error.StatusCode === 401 ||
         error.StatusCode === 403;
}

/**
 * Determines if an error is validation-related
 * @param error ServiceError from the API
 * @returns True if it's a validation error
 */
export function isValidationError(error: ServiceError): boolean {
  return error.Category === 'Validation' ||
         (error.StatusCode === 400 && !isAuthError(error));
}

/**
 * Determines if an error should trigger a redirect to login
 * @param error ServiceError from the API
 * @returns True if user should be redirected to login
 */
export function shouldRedirectToLogin(error: ServiceError): boolean {
  // Only redirect for token-related authentication errors
  return error.StatusCode === 401 && 
         (error.Category === 'Token' || 
          error.ErrorCode === 'TOKEN_EXPIRED' ||
          error.ErrorCode === 'INVALID_TOKEN_SIGNATURE' ||
          error.ErrorCode === 'INVALID_TOKEN_FORMAT');
}

/**
 * Determines if an error is critical (requires immediate user attention)
 * @param error ServiceError from the API
 * @returns True if it's a critical error
 */
export function isCriticalError(error: ServiceError): boolean {
  return isServerError(error) || 
         isAuthError(error) ||
         error.ErrorCode === 'NETWORK_ERROR';
}

/**
 * Determines if an error is retryable (user can try the same action again)
 * @param error ServiceError from the API
 * @returns True if the error is retryable
 */
export function isRetryableError(error: ServiceError): boolean {
  const retryableErrors = [
    'NETWORK_ERROR',
    'INTERNAL_SERVER_ERROR',
    'TOO_MANY_REQUESTS',
    'STORAGE_SERVICE_UNAVAILABLE',
    'DATABASE_ERROR'
  ];

  return retryableErrors.includes(error.ErrorCode ?? "UNKNOWN_ERROR") ||
         isServerError(error);
}

/**
 * Determines if an error requires user action (not automatic/system)
 * @param error ServiceError from the API
 * @returns True if user action is required
 */
export function requiresUserAction(error: ServiceError): boolean {
  const userActionErrors = [
    'EMAIL_ALREADY_EXISTS',
    'INVALID_CREDENTIALS',
    'EMAIL_NOT_VERIFIED',
    'PASSWORD_TOO_WEAK',
    'TERMS_NOT_ACCEPTED',
    'INVALID_IMAGE_FORMAT',
    'IMAGE_TOO_LARGE',
    'INSUFFICIENT_STOCK'
  ];

  return userActionErrors.includes(error.ErrorCode ?? "UNKNOWN_ERROR") ||
         isValidationError(error);
}

/**
 * Gets the priority level of an error for display ordering
 * @param error ServiceError from the API
 * @returns Priority level (higher number = higher priority)
 */
export function getErrorPriority(error: ServiceError): number {
  // Critical errors (highest priority)
  if (isCriticalError(error)) {
    return 3;
  }
  
  // Authentication errors (high priority)
  if (isAuthError(error)) {
    return 2;
  }
  
  // Validation/user action errors (normal priority)
  if (requiresUserAction(error)) {
    return 1;
  }
  
  // Everything else (low priority)
  return 0;
}

/**
 * Determines if an error should be logged for debugging
 * @param error ServiceError from the API
 * @returns True if the error should be logged
 */
export function shouldLogError(error: ServiceError): boolean {
  // Log all server errors
  if (isServerError(error)) {
    return true;
  }
  
  // Log authentication errors (for security monitoring)
  if (isAuthError(error)) {
    return true;
  }
  
  // Log network errors
  if (error.ErrorCode === 'NETWORK_ERROR') {
    return true;
  }
  
  // Don't log common validation errors
  return false;
}

/**
 * Classification result for comprehensive error analysis
 */
export type ErrorClassification = {
  showAsToast: boolean;
  isNetwork: boolean;
  isServer: boolean;
  isClient: boolean;
  isAuth: boolean;
  isValidation: boolean;
  shouldRedirect: boolean;
  isCritical: boolean;
  isRetryable: boolean;
  requiresAction: boolean;
  priority: number;
  shouldLog: boolean;
};

/**
 * Comprehensive error classification function
 * @param error ServiceError or Axios error
 * @returns Complete classification of the error
 */
export function classifyError(error: any): ErrorClassification {
  // Handle Axios errors
  if (error.response) {
    const serviceError = error.response.data as ServiceError;
    return classifyServiceError(serviceError);
  } else if (isNetworkError(error)) {
    return {
      showAsToast: true,
      isNetwork: true,
      isServer: false,
      isClient: false,
      isAuth: false,
      isValidation: false,
      shouldRedirect: false,
      isCritical: true,
      isRetryable: true,
      requiresAction: false,
      priority: 3,
      shouldLog: true,
    };
  } else {
    // Request setup error
    return {
      showAsToast: true,
      isNetwork: false,
      isServer: false,
      isClient: false,
      isAuth: false,
      isValidation: false,
      shouldRedirect: false,
      isCritical: false,
      isRetryable: true,
      requiresAction: false,
      priority: 1,
      shouldLog: true,
    };
  }
}

/**
 * Classify a ServiceError specifically
 * @param error ServiceError from the API
 * @returns Complete classification of the ServiceError
 */
export function classifyServiceError(error: ServiceError): ErrorClassification {
  return {
    showAsToast: shouldShowAsToast(error),
    isNetwork: false,
    isServer: isServerError(error),
    isClient: isClientError(error),
    isAuth: isAuthError(error),
    isValidation: isValidationError(error),
    shouldRedirect: shouldRedirectToLogin(error),
    isCritical: isCriticalError(error),
    isRetryable: isRetryableError(error),
    requiresAction: requiresUserAction(error),
    priority: getErrorPriority(error),
    shouldLog: shouldLogError(error),
  };
}