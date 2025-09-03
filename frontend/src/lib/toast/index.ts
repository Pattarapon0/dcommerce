/**
 * Toast Error Handling System
 * 
 * This module provides a comprehensive error handling system with toast notifications
 * using Sonner for beautiful, accessible toast UI components.
 * 
 * Features:
 * - Automatic error toast display for API errors
 * - Form validation error detection (skips toast, for inline display)
 * - Success toast utilities
 * - Comprehensive error classification
 * - Console testing utilities
 * 
 * @example Basic Usage:
 * ```typescript
 * import { successToasts } from '@/lib/toast';
 * 
 * // Success toast
 * successToasts.login();
 * 
 * // Custom success toast
 * successToasts.custom('Operation completed!');
 * 
 * // Errors are handled automatically by Axios interceptor
 * ```
 * 
 * @example Testing:
 * ```typescript
 * // In browser console:
 * testToastSystem(); // Full test suite
 * testScenarios.authError(); // Single test
 * ```
 */

// Core error handling
export { 
  handleApiError, 
  showSuccessToast, 
  showToast,
  clearAllToasts,
  debugErrorHandling 
} from '../errors/errorHandler';

// Error classification utilities
export { 
  shouldShowAsToast,
  isServerError,
  isAuthError,
  classifyError 
} from '../errors/errorClassifier';

// Success toast utilities
export { successToasts, SUCCESS_MESSAGES } from '../success/successToasts';

// Testing utilities

// Error message mapping
export { getToastMessage, getToastTitle } from '../errors/errorMessages';

// Sonner toast function for direct usage
export { toast } from 'sonner';  