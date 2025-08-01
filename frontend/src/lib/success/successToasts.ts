import { showSuccessToast } from '@/lib/errors/errorHandler';

/**
 * Pre-defined success messages for common application actions
 * These provide consistent messaging across the application
 */
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTER_SUCCESS: 'Account created successfully! Please check your email to verify.',
  EMAIL_VERIFIED: 'Email verified successfully!',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  
  // Profile/User
  PROFILE_UPDATED: 'Profile updated successfully',
  PREFERENCES_SAVED: 'Preferences saved',
  ADDRESS_ADDED: 'Address added successfully',
  ADDRESS_UPDATED: 'Address updated successfully',
  ADDRESS_DELETED: 'Address removed',
  
  // Products
  PRODUCT_CREATED: 'Product listed successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product removed',
  
  // Cart/Orders
  ADDED_TO_CART: 'Added to cart',
  REMOVED_FROM_CART: 'Removed from cart',
  CART_CLEARED: 'Cart cleared',
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_CANCELLED: 'Order cancelled',
  
  // Images/Upload
  IMAGE_UPLOADED: 'Image uploaded successfully',
  IMAGES_UPLOADED: 'Images uploaded successfully',
  
  // General
  CHANGES_SAVED: 'Changes saved successfully',
  ITEM_DELETED: 'Item deleted successfully',
  COPY_SUCCESS: 'Copied to clipboard',
  EXPORT_SUCCESS: 'Export completed successfully',
} as const;

/**
 * Helper functions for showing success toasts for common actions
 * These provide a consistent API and reduce code duplication
 */
export const successToasts = {
  // Authentication actions
  login: () => showSuccessToast(SUCCESS_MESSAGES.LOGIN_SUCCESS),
  logout: () => showSuccessToast(SUCCESS_MESSAGES.LOGOUT_SUCCESS),
  register: () => showSuccessToast(SUCCESS_MESSAGES.REGISTER_SUCCESS),
  emailVerified: () => showSuccessToast(SUCCESS_MESSAGES.EMAIL_VERIFIED),
  passwordResetSent: () => showSuccessToast(SUCCESS_MESSAGES.PASSWORD_RESET_SENT),
  passwordResetSuccess: () => showSuccessToast(SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS),
  
  // Profile actions
  profileUpdated: () => showSuccessToast(SUCCESS_MESSAGES.PROFILE_UPDATED),
  preferencesSaved: () => showSuccessToast(SUCCESS_MESSAGES.PREFERENCES_SAVED),
  addressAdded: () => showSuccessToast(SUCCESS_MESSAGES.ADDRESS_ADDED),
  addressUpdated: () => showSuccessToast(SUCCESS_MESSAGES.ADDRESS_UPDATED),
  addressDeleted: () => showSuccessToast(SUCCESS_MESSAGES.ADDRESS_DELETED),
  
  // Product actions
  productCreated: () => showSuccessToast(SUCCESS_MESSAGES.PRODUCT_CREATED),
  productUpdated: () => showSuccessToast(SUCCESS_MESSAGES.PRODUCT_UPDATED),
  productDeleted: () => showSuccessToast(SUCCESS_MESSAGES.PRODUCT_DELETED),
  
  // Cart/Order actions
  addedToCart: (productName?: string) => {
    const message = productName 
      ? `${productName} added to cart`
      : SUCCESS_MESSAGES.ADDED_TO_CART;
    showSuccessToast(message);
  },
  removedFromCart: (productName?: string) => {
    const message = productName 
      ? `${productName} removed from cart`
      : SUCCESS_MESSAGES.REMOVED_FROM_CART;
    showSuccessToast(message);
  },
  cartCleared: () => showSuccessToast(SUCCESS_MESSAGES.CART_CLEARED),
  orderPlaced: (orderNumber?: string) => {
    const message = orderNumber 
      ? `Order #${orderNumber} placed successfully!`
      : SUCCESS_MESSAGES.ORDER_PLACED;
    showSuccessToast(message);
  },
  orderCancelled: () => showSuccessToast(SUCCESS_MESSAGES.ORDER_CANCELLED),
  
  // Upload actions
  imageUploaded: () => showSuccessToast(SUCCESS_MESSAGES.IMAGE_UPLOADED),
  imagesUploaded: (count?: number) => {
    const message = count 
      ? `${count} images uploaded successfully`
      : SUCCESS_MESSAGES.IMAGES_UPLOADED;
    showSuccessToast(message);
  },
  
  // General actions
  changesSaved: () => showSuccessToast(SUCCESS_MESSAGES.CHANGES_SAVED),
  itemDeleted: (itemName?: string) => {
    const message = itemName 
      ? `${itemName} deleted successfully`
      : SUCCESS_MESSAGES.ITEM_DELETED;
    showSuccessToast(message);
  },
  copySuccess: (what?: string) => {
    const message = what 
      ? `${what} copied to clipboard`
      : SUCCESS_MESSAGES.COPY_SUCCESS;
    showSuccessToast(message);
  },
  exportSuccess: () => showSuccessToast(SUCCESS_MESSAGES.EXPORT_SUCCESS),
  
  // Custom message
  custom: (message: string) => showSuccessToast(message),
};

/**
 * Usage examples for components:
 * 
 * // Basic usage
 * import { successToasts } from '@/lib/success/successToasts';
 * 
 * // In a login component
 * const handleLogin = async () => {
 *   try {
 *     await apiClient.post('/auth/login', data);
 *     successToasts.login(); // Shows "Welcome back!"
 *     router.push('/dashboard');
 *   } catch (error) {
 *     // Error automatically handled by Axios interceptor
 *   }
 * };
 * 
 * // In a product component
 * const handleAddToCart = async () => {
 *   try {
 *     await apiClient.post('/cart/items', { productId, quantity });
 *     successToasts.addedToCart(product.name); // Shows "Product Name added to cart"
 *   } catch (error) {
 *     // Error automatically handled
 *   }
 * };
 * 
 * // Custom message
 * successToasts.custom('Your custom success message');
 */

// Make success toasts available in browser console for testing
if (typeof window !== 'undefined') {
  (window as any).successToasts = successToasts;
  console.log('✅ Success toasts available! Try: successToasts.login()');
}