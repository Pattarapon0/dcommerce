import  { components } from '@/lib/types/api';
import { getToastMessage, getToastTitle } from '@/lib/errors/errorMessages';


type ServiceError = components["schemas"]["ServiceError"];

/**
 * Represents a toast item in the queue
 */
export type ToastItem = {
  id: string;
  title: string;
  description: string;
  variant: 'destructive' | 'default' | 'success';
  duration: number;
  createdAt: number;
};

/**
 * Toast store using useSyncExternalStore pattern for managing toast notifications
 * This store manages the global toast queue state
 */
class ToastStore {
  private listeners = new Set<() => void>();
  private toasts: ToastItem[] = [];

  /**
   * Subscribe to store changes (required by useSyncExternalStore)
   * @param listener Function to call when store changes
   * @returns Unsubscribe function
   */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * Get current store state (required by useSyncExternalStore)
   * @returns Current toast queue
   */
  getSnapshot = (): ToastItem[] => {
    return this.toasts;
  };

  /**
   * Get server snapshot for SSR (required by useSyncExternalStore)
   * @returns Empty array (no toasts during SSR)
   */
  getServerSnapshot = (): ToastItem[] => {
    return [];
  };

  /**
   * Add an error toast to the queue
   * @param error ServiceError from the API
   */
  addError = (error: ServiceError): void => {
    const toast: ToastItem = {
      id: crypto.randomUUID(),
      title: getToastTitle(error.Category ?? 'Error'),
      description: getToastMessage(error),
      variant: this.getErrorVariant(error),
      duration: this.getErrorDuration(error),
      createdAt: Date.now(),
    };

    this.toasts.push(toast);
    this.notifyListeners();
    
    console.log('📢 Added error toast:', {
      id: toast.id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant
    });
  };

  /**
   * Add a success toast to the queue
   * @param message Success message to display
   */
  addSuccess = (message: string): void => {
    const toast: ToastItem = {
      id: crypto.randomUUID(),
      title: "Success",
      description: message,
      variant: 'success',
      duration: 4000,
      createdAt: Date.now(),
    };

    this.toasts.push(toast);
    this.notifyListeners();
    
    console.log('✅ Added success toast:', {
      id: toast.id,
      description: toast.description
    });
  };

  /**
   * Add a generic toast to the queue
   * @param title Toast title
   * @param description Toast message
   * @param variant Toast style variant
   * @param duration Duration in milliseconds
   */
  addToast = (
    title: string, 
    description: string, 
    variant: ToastItem['variant'] = 'default',
    duration: number = 6000
  ): void => {
    const toast: ToastItem = {
      id: crypto.randomUUID(),
      title,
      description,
      variant,
      duration,
      createdAt: Date.now(),
    };

    this.toasts.push(toast);
    this.notifyListeners();
    
    console.log('📢 Added toast:', {
      id: toast.id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant
    });
  };

  /**
   * Remove a specific toast from the queue
   * @param id Toast ID to remove
   */
  removeToast = (id: string): void => {
    const initialLength = this.toasts.length;
    this.toasts = this.toasts.filter(t => t.id !== id);
    
    if (this.toasts.length !== initialLength) {
      this.notifyListeners();
      console.log('🗑️ Removed toast:', id);
    }
  };

  /**
   * Clear all toasts from the queue
   */
  clearAll = (): void => {
    const clearedCount = this.toasts.length;
    this.toasts = [];
    
    if (clearedCount > 0) {
      this.notifyListeners();
      console.log('🧹 Cleared all toasts:', clearedCount);
    }
  };

  /**
   * Get the number of toasts in the queue
   * @returns Number of toasts
   */
  getCount = (): number => {
    return this.toasts.length;
  };

  /**
   * Get toast variant based on error severity
   * @param error ServiceError
   * @returns Toast variant
   */
  private getErrorVariant(error: ServiceError): 'destructive' | 'default' {
    // Server errors (500+) = destructive (red)
    if ((error.StatusCode ?? 500) >= 500) {
      return 'destructive';
    }
    
    // Authentication/Token errors = destructive (important)
    if (error.Category === 'Authentication' || error.Category === 'Token') {
      return 'destructive';
    }
    
    // Image upload errors = destructive
    if (error.Category === 'Image') {
      return 'destructive';
    }
    
    // Everything else = default (usually orange/yellow warning)
    return 'default';
  }

  /**
   * Get toast duration based on error severity
   * @param error ServiceError
   * @returns Duration in milliseconds
   */
  private getErrorDuration(error: ServiceError): number {
    // Server errors stay longer (users might want to screenshot)
    if ((error.StatusCode ?? 500) >= 500) {
      return 10000; // 10 seconds
    }
    
    // Auth errors stay longer (important for users to read)
    if (error.Category === 'Authentication' || error.Category === 'Token') {
      return 8000; // 8 seconds
    }
    
    // Rate limiting stays longer (users need to wait)
    if (error.ErrorCode === 'TOO_MANY_REQUESTS') {
      return 8000; // 8 seconds
    }
    
    // Regular errors
    return 6000; // 6 seconds
  }

  /**
   * Notify all listeners that the store has changed
   */
  private notifyListeners = (): void => {
    this.listeners.forEach(listener => listener());
  };

  /**
   * Debug method to log current store state
   */
  debug = (): void => {
    console.log('🔍 Toast Store Debug:', {
      toastCount: this.toasts.length,
      listenerCount: this.listeners.size,
      toasts: this.toasts.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        variant: t.variant,
        age: Date.now() - t.createdAt
      }))
    });
  };
}

/**
 * Singleton toast store instance
 * Use this throughout the application for consistent toast management
 */
export const toastStore = new ToastStore();

// Make it available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).toastStore = toastStore;
}