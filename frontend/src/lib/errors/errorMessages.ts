import type { components } from '@/lib/types/api';

type ServiceError = components["schemas"]["ServiceError"];

/**
 * Maps backend error codes to user-friendly messages
 * Based on the ServiceError error codes from the backend
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  "EMAIL_ALREADY_EXISTS": "This email is already registered. Try logging in instead.",
  "INVALID_CREDENTIALS": "Invalid email or password. Please try again.",
  "TOKEN_EXPIRED": "Your session has expired. Please log in again.",
  "EMAIL_NOT_VERIFIED": "Please check your email and verify your account.",
  "ACCOUNT_LOCKED": "Account temporarily locked. Please try again later.",
  
  // Token errors
  "TOKEN_GENERATION_FAILED": "Login failed. Please try again.",
  "INVALID_TOKEN_SIGNATURE": "Session invalid. Please log in again.",
  "INVALID_TOKEN_FORMAT": "Session invalid. Please log in again.",
  "TOKEN_NOT_YET_VALID": "Session invalid. Please log in again.",
  "TOKEN_VALIDATION_FAILED": "Session invalid. Please log in again.",
  "MISSING_TOKEN_CLAIMS": "Session invalid. Please log in again.",
  "INVALID_TOKEN": "Session invalid. Please log in again.",
  
  // Password errors
  "PASSWORD_TOO_WEAK": "Password doesn't meet security requirements. Please choose a stronger password.",
  "PASSWORD_HASH_FAILED": "Authentication system error. Please try again.",
  "PASSWORD_COMPLEXITY_FAILED": "Password must contain uppercase, lowercase, digit, and special character.",
  
  // Validation errors
  "VALIDATION_FAILED": "Please check your input and try again.",
  "FIELD_VALIDATION_ERROR": "Please check your input and try again.",
  "REQUIRED_FIELDS_MISSING": "Please fill in all required fields.",
  "INVALID_REGISTRATION_DATA": "Please check your registration information.",
  "EMAIL_FORMAT_INVALID": "Please enter a valid email address.",
  "TERMS_NOT_ACCEPTED": "You must accept the terms and conditions.",
  "DATE_OF_BIRTH_REQUIRED": "Date of birth is required.",
  "INVALID_NAME_FORMAT": "Name contains invalid characters.",
  "VALUE_TOO_LONG": "Input is too long. Please shorten it.",
  "VALUE_TOO_SHORT": "Input is too short. Please lengthen it.",
  
  // Product errors
  "PRODUCT_NOT_FOUND": "This product is no longer available.",
  "INSUFFICIENT_STOCK": "Not enough items in stock. Please reduce quantity.",
  
  // Image errors
  "INVALID_IMAGE_FORMAT": "Please upload a JPG, PNG, WebP, or GIF file.",
  "IMAGE_TOO_LARGE": "Image too large. Please use a file under 5MB.",
  "IMAGE_UPLOAD_RATE_LIMIT": "Too many uploads. Please wait a moment and try again.",
  "STORAGE_SERVICE_UNAVAILABLE": "Upload service temporarily unavailable. Please try again later.",
  "INVALID_IMAGE_CONTENT": "File is not a valid image. Please try another file.",
  "STORAGE_QUOTA_EXCEEDED": "Storage limit reached. Please delete some files or upgrade.",
  "IMAGE_NOT_FOUND": "Image not found.",
  
  // System/Database errors
  "INTERNAL_SERVER_ERROR": "Something went wrong on our end. Please try again.",
  "DATABASE_ERROR": "Service temporarily unavailable. Please try again later.",
  "TOO_MANY_REQUESTS": "Too many requests. Please wait a moment and try again.",
  "NETWORK_ERROR": "Connection failed. Please check your internet and try again.",
  "REQUEST_ERROR": "Failed to send request. Please try again.",
  "UNKNOWN_ERROR": "An unexpected error occurred. Please try again.",
  
  // Generic errors by entity
  "USER_NOT_FOUND": "User account not found.",
  "USER_ALREADY_EXISTS": "User account already exists.",
  "USER_INACTIVE": "User account is inactive.",
  
  // Resource errors
  "RESOURCE_CONFLICT": "This action conflicts with existing data.",
  "UNAUTHORIZED_ACCESS": "You don't have permission to access this.",
  "PERMISSION_DENIED": "You don't have permission to perform this action.",
  "FORBIDDEN": "Access denied.",
  "BAD_REQUEST": "Invalid request. Please check your input.",
  
  // Database constraint errors
  "INVALID_REFERENCE": "Invalid reference to related data.",
  "DATA_VALIDATION_FAILED": "Data validation failed.",
  "REQUIRED_DATA_MISSING": "Required data is missing.",
  "INVALID_OPERATION": "Invalid operation.",
} as const;

/**
 * Gets a user-friendly error message for display in toasts
 * @param error ServiceError from the API
 * @returns User-friendly message string
 */
export function getToastMessage(error: ServiceError): string {
  // Try exact error code match first
  if (error.ErrorCode && ERROR_MESSAGES[error.ErrorCode]) {
    return ERROR_MESSAGES[error.ErrorCode];
  }
  
  // Fallback to backend message if it seems user-friendly
  if (error.Message && isUserFriendlyMessage(error.Message)) {
    return error.Message;
  }
  
  // Final fallback
  return "Something went wrong. Please try again.";
}

/**
 * Determines if a backend message is user-friendly enough to show directly
 * @param message The backend error message
 * @returns True if the message is safe to show to users
 */
function isUserFriendlyMessage(message: string): boolean {
  // Don't show messages that contain technical terms
  const technicalTerms = [
    'null',
    'undefined',
    'exception',
    'stack trace',
    'database',
    'sql',
    'constraint',
    'foreign key',
    'primary key',
    'index',
    'column',
    'table'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // Check if message contains technical terms
  const hasTechnicalTerms = technicalTerms.some(term => 
    lowerMessage.includes(term)
  );
  
  // Don't show very long messages (likely technical)
  const isTooLong = message.length > 100;
  
  // Don't show messages with special characters that suggest technical content
  const hasTechnicalChars = /[{}[\]<>|\\]/.test(message);
  
  return !hasTechnicalTerms && !isTooLong && !hasTechnicalChars;
}

/**
 * Gets the appropriate toast title based on error category
 * @param category ServiceError category
 * @returns Title string for the toast
 */
export function getToastTitle(category: string): string {
  switch (category) {
    case 'Authentication':
    case 'Token':
      return 'Authentication Error';
    case 'Password':
      return 'Password Error';
    case 'Validation':
      return 'Validation Error';
    case 'Product':
      return 'Product Error';
    case 'Image':
      return 'Upload Error';
    case 'Database':
      return 'Service Error';
    default:
      return 'Error';
  }
}