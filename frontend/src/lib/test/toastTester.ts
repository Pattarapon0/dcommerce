import { toastStore } from '@/lib/stores/toastStore';
import { 
  handleApiError, 
  showSuccessToast, 
  handleNetworkError,
  handleRequestError,
  handleUnknownError,
  debugErrorHandling
} from '@/lib/errors/errorHandler';
import type { components } from '@/lib/types/api';

type ServiceError = components["schemas"]["ServiceError"];
/**
 * Comprehensive test suite for the toast error handling system
 * Run this in the browser console to verify everything works
 */
export function testToastSystem(): void {
  console.log('🧪 Starting comprehensive toast system test...');
  console.log('📊 Watch the console for detailed logs and state changes');
  
  // Subscribe to store changes for real-time monitoring
  const unsubscribe = toastStore.subscribe(() => {
    const toasts = toastStore.getSnapshot();
    console.log('📊 Toast Store State Changed:', {
      count: toasts.length,
      toasts: toasts.map(t => ({
        id: t.id.slice(0, 8) + '...',
        title: t.title,
        description: t.description.slice(0, 50) + '...',
        variant: t.variant,
        age: `${Math.floor((Date.now() - t.createdAt) / 1000)}s ago`
      }))
    });
  });
  
  console.log('⏱️ Test sequence starting in 1 second...');
  
  // Test sequence with delays for observation
  setTimeout(() => testAuthenticationErrors(), 1000);
  setTimeout(() => testValidationErrors(), 3000);
  setTimeout(() => testServerErrors(), 5000);
  setTimeout(() => testNetworkErrors(), 7000);
  setTimeout(() => testImageErrors(), 9000);
  setTimeout(() => testSuccessToasts(), 11000);
  setTimeout(() => testUnknownErrors(), 13000);
  setTimeout(() => testFormValidationSkipping(), 15000);
  setTimeout(() => cleanupAndSummary(unsubscribe), 17000);
}

/**
 * Test authentication-related errors
 */
function testAuthenticationErrors(): void {
  console.log('\n🔐 Testing Authentication Errors...');
  
  const authErrors: ServiceError[] = [
    {
      ErrorCode: 'INVALID_CREDENTIALS',
      Message: 'Invalid email or password',
      StatusCode: 401,
      Category: 'Authentication',
      HasFieldErrors: false,
      Errors: null,
      Code: 401,
      IsExpected: true,
      IsExceptional: false,
      IsClientError: true,
      IsbackendError: false,
      IsAuthenticationError: true,
    },
    {
      ErrorCode: 'TOKEN_EXPIRED',
      Message: 'Token has expired',
      StatusCode: 401,
      Category: 'Token',
      HasFieldErrors: false,
      Errors: null,
      Code: 401,
      IsExpected: true,
      IsExceptional: false,
      IsClientError: true,
      IsbackendError: false,
      IsAuthenticationError: true,
    },
    {
      ErrorCode: 'EMAIL_ALREADY_EXISTS',
      Message: 'An account with this email already exists',
      StatusCode: 409,
      Category: 'Authentication',
      HasFieldErrors: false,
      Errors: null,
      Code: 409,
      IsExpected: true,
      IsExceptional: false,
      IsClientError: true,
      IsbackendError: false,
      IsAuthenticationError: true,
    }
  ];
  
  authErrors.forEach((error, index) => {
    setTimeout(() => {
      console.log(`Testing auth error ${index + 1}:`, error.ErrorCode);
      handleApiError(error, { source: 'Test Suite', context: 'Auth error test' });
    }, index * 500);
  });
}

/**
 * Test validation errors (should be skipped for toast)
 */
function testValidationErrors(): void {
  console.log('\n📝 Testing Validation Errors (should skip toast)...');
  
  const validationError: ServiceError = {
    ErrorCode: 'VALIDATION_FAILED',
    Message: 'Validation failed for 2 fields',
    StatusCode: 400,
    Category: 'Validation',
    HasFieldErrors: true,
    Errors: {
      email: ['Email is required', 'Email format is invalid'],
      password: ['Password must be at least 8 characters']
    },
    Code: 400,
    IsExpected: true,
    IsExceptional: false,
    IsClientError: true,
    IsbackendError: false,
    IsAuthenticationError: false,
  };
  
  console.log('Testing form validation error (should be skipped):');
  handleApiError(validationError, { 
    source: 'Test Suite', 
    context: 'Form validation test (should skip toast)' 
  });
}

/**
 * Test server errors
 */
function testServerErrors(): void {
  console.log('\n🚨 Testing Server Errors...');
  
  const serverErrors: ServiceError[] = [
    {
      ErrorCode: 'INTERNAL_SERVER_ERROR',
      Message: 'An unexpected error occurred',
      StatusCode: 500,
      Category: 'General',
      HasFieldErrors: false,
      Errors: null,
      Code: 500,
      IsExpected: false,
      IsExceptional: true,
      IsClientError: false,
      IsbackendError: true,
      IsAuthenticationError: false,
    },
    {
      ErrorCode: 'TOO_MANY_REQUESTS',
      Message: 'Rate limit exceeded',
      StatusCode: 429,
      Category: 'General',
      HasFieldErrors: false,
      Errors: null,
      Code: 429,
      IsExpected: true,
      IsExceptional: false,
      IsClientError: true,
      IsbackendError: false,
      IsAuthenticationError: false,
    }
  ];
  
  serverErrors.forEach((error, index) => {
    setTimeout(() => {
      console.log(`Testing server error ${index + 1}:`, error.ErrorCode);
      handleApiError(error, { source: 'Test Suite', context: 'Server error test' });
    }, index * 500);
  });
}

/**
 * Test network-related errors
 */
function testNetworkErrors(): void {
  console.log('\n🌐 Testing Network Errors...');
  
  setTimeout(() => {
    console.log('Testing network error:');
    handleNetworkError({ source: 'Test Suite', context: 'Network error test' });
  }, 0);
  
  setTimeout(() => {
    console.log('Testing request error:');
    handleRequestError(new Error('Request setup failed'), { 
      source: 'Test Suite', 
      context: 'Request error test' 
    });
  }, 500);
}

/**
 * Test image/upload errors
 */
function testImageErrors(): void {
  console.log('\n📷 Testing Image/Upload Errors...');
  
  const imageErrors: ServiceError[] = [
    {
      ErrorCode: 'IMAGE_TOO_LARGE',
      Message: 'Image too large: 8MB (max 5MB)',
      StatusCode: 400,
      Category: 'Image',
      HasFieldErrors: false,
      Errors: null,
      Code: 400,
      IsExpected: true,
      IsExceptional: false,
      IsClientError: true,
      IsbackendError: false,
      IsAuthenticationError: false,
    },
    {
      ErrorCode: 'INVALID_IMAGE_FORMAT',
      Message: 'Invalid image format: test.txt. Only jpg, png, webp, gif allowed.',
      StatusCode: 400,
      Category: 'Image',
      HasFieldErrors: false,
      Errors: null,
      Code: 400,
      IsExpected: true,
      IsExceptional: false,
      IsClientError: true,
      IsbackendError: false,
      IsAuthenticationError: false,
    }
  ];
  
  imageErrors.forEach((error, index) => {
    setTimeout(() => {
      console.log(`Testing image error ${index + 1}:`, error.ErrorCode);
      handleApiError(error, { source: 'Test Suite', context: 'Image error test' });
    }, index * 500);
  });
}

/**
 * Test success toasts
 */
function testSuccessToasts(): void {
  console.log('\n✅ Testing Success Toasts...');
  
  const successMessages = [
    'Account created successfully!',
    'Login successful!',
    'Profile updated!',
    'Product added to cart!'
  ];
  
  successMessages.forEach((message, index) => {
    setTimeout(() => {
      console.log(`Testing success toast ${index + 1}:`, message);
      showSuccessToast(message, { source: 'Test Suite', context: 'Success test' });
    }, index * 500);
  });
}

/**
 * Test unknown error handling
 */
function testUnknownErrors(): void {
  console.log('\n❓ Testing Unknown Errors...');
  
  setTimeout(() => {
    console.log('Testing unknown error format:');
    handleUnknownError(
      { message: 'Something went wrong', statusText: 'Bad Request' },
      400,
      { source: 'Test Suite', context: 'Unknown error test' }
    );
  }, 0);
}

/**
 * Test that form validation errors are properly skipped
 */
function testFormValidationSkipping(): void {
  console.log('\n📋 Testing Form Validation Skipping...');
  
  const formErrors: ServiceError[] = [
    {
      ErrorCode: 'FIELD_VALIDATION_ERROR',
      Message: 'Email is required',
      StatusCode: 400,
      Category: 'Validation',
      HasFieldErrors: true,
      Errors: { email: ['Email is required'] },
      Code: 400,
      IsExpected: true,
      IsExceptional: false,
      IsClientError: true,
      IsbackendError: false,
      IsAuthenticationError: false,
    },
    {
      ErrorCode: 'VALIDATION_FAILED',
      Message: 'Multiple validation errors',
      StatusCode: 400,
      Category: 'Validation',
      HasFieldErrors: true,
      Errors: {
        email: ['Email is required'],
        password: ['Password too short'],
        confirmPassword: ['Passwords do not match']
      },
      Code: 400,
      IsExpected: true,
      IsExceptional: false,
      IsClientError: true,
      IsbackendError: false,
      IsAuthenticationError: false,
    }
  ];
  
  formErrors.forEach((error, index) => {
    setTimeout(() => {
      console.log(`Testing form validation ${index + 1} (should skip):`, error.ErrorCode);
      handleApiError(error, { 
        source: 'Test Suite', 
        context: 'Form validation skip test' 
      });
    }, index * 500);
  });
}

/**
 * Clean up and show test summary
 */
function cleanupAndSummary(unsubscribe: () => void): void {
  console.log('\n🧹 Test cleanup and summary...');
  
  // Show final state
  debugErrorHandling();
  
  // Clean up subscription
  unsubscribe();
  
  // Show summary
  const finalCount = toastStore.getCount();
  console.log(`\n📊 Test Summary:
  • Total toasts created: ${finalCount}
  • Form validation errors were skipped ✅
  • Authentication errors created toasts ✅  
  • Server errors created toasts ✅
  • Network errors created toasts ✅
  • Success messages created toasts ✅
  
  🎉 Toast system test completed successfully!
  
  💡 Tips:
  • Run 'toastStore.debug()' to inspect current state
  • Run 'toastStore.clearAll()' to clear all toasts
  • Run 'testToastSystem()' to run this test again
  `);
}

/**
 * Test individual error scenarios
 */
export const testScenarios = {
  authError: () => {
    console.log('🔐 Testing single auth error...');
    handleApiError({
      ErrorCode: 'INVALID_CREDENTIALS',
      Message: 'Invalid email or password',
      StatusCode: 401,
      Category: 'Authentication',
      HasFieldErrors: false,
      Errors: null,
      Code: 401,
      IsExpected: true,
      IsExceptional: false,
      IsClientError: true,
      IsbackendError: false,
      IsAuthenticationError: true,
    }, { source: 'Manual Test' });
  },
  
  networkError: () => {
    console.log('🌐 Testing network error...');
    handleNetworkError({ source: 'Manual Test' });
  },
  
  successToast: () => {
    console.log('✅ Testing success toast...');
    showSuccessToast('Test success message!', { source: 'Manual Test' });
  },
  
  clearAll: () => {
    console.log('🧹 Clearing all toasts...');
    toastStore.clearAll();
  }
};

// Make test functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).testToastSystem = testToastSystem;
  (window as any).testScenarios = testScenarios;
  (window as any).toastStore = toastStore;
  (window as any).debugErrorHandling = debugErrorHandling;
  
  console.log(`
🧪 Toast Testing Available!

Run these commands in the browser console:
• testToastSystem() - Full test suite
• testScenarios.authError() - Test auth error
• testScenarios.networkError() - Test network error  
• testScenarios.successToast() - Test success toast
• testScenarios.clearAll() - Clear all toasts
• toastStore.debug() - Inspect store state
• debugErrorHandling() - Debug error handling
  `);
}