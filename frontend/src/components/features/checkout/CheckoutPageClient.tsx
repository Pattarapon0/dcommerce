"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useAtomValue } from 'jotai';
import { userAddressAtom } from '@/stores/address';
import { CartSummaryDto } from '@/stores/cart';
import CheckoutForm from "./CheckoutForm";
import CheckoutSummary from "./CheckoutSummary";
import MobileOrderSummary from "./MobileOrderSummary";
import { useCreateOrder } from "@/hooks/useOrderMutations";

export default function CheckoutPageClient() {
  // ALL HOOKS must be called at the top, before any conditional returns
  const router = useRouter();
  const { isAuthenticated,userProfile } = useAuth();
  const phoneNumber = userProfile?.PhoneNumber || '';
  const { cart, isLoading, error } = useCart();
  const userAddressQuery = useAtomValue(userAddressAtom);
  const createOrderMutation = useCreateOrder();
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isValidatingCart, setIsValidatingCart] = useState(false);

  // Calculate derived values
  const cartData = cart;
  const subtotal = cartData?.TotalAmount || 0;
  const shipping = 0; // Free shipping
  const tax = Math.round(subtotal * 0.07); // 7% tax
  const total = subtotal + shipping + tax;
  const userAddress = userAddressQuery.data;
  const hasAddress = userAddress?.AddressLine1;
  const isPlacingOrder = createOrderMutation.isPending;

  // Functions
  const handlePlaceOrder = async () => {
    setOrderError(null);
    
    try {
      const order = await createOrderMutation.mutateAsync();
      // Success - redirect to order confirmation
      router.push(`/orders/${order.Id}`);
    } catch (error: any) {
      setOrderError(error?.response?.data?.message || "Failed to place order. Please try again.");
    }
  };

  // NOW we can do conditional returns (after all hooks are called)
  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">You need to be logged in to proceed with checkout.</p>
        <button 
          onClick={() => router.push('/login')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Check if cart is empty - redirect to cart page
  if (cart && cart.TotalItems === 0) {
    router.push('/cart');
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Redirecting to cart page...</p>
      </div>
    );
  }

  // Check if user has address
  if (!hasAddress) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Address Required</h1>
        <p className="text-gray-600 mb-6">You need to add a shipping address before proceeding with checkout.</p>
        <button 
          onClick={() => router.push('/profile')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Add Address in Profile
        </button>
      </div>
    );
  }

  return (
    <div >
      <div className="max-w-6xl mx-auto px-4">
        {/* Page Header */}
        <div className="py-4 border-b border-gray-100 ">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-sm text-gray-600 mt-1">Complete your order below</p>
        </div>

        {orderError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{orderError}</p>
          </div>
        )}

        {/* Show loading state */}
        {(isLoading === true || userAddressQuery.isLoading === true) && (
          <div className="text-center py-6">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Show error state */}
        {(!!error || !!userAddressQuery.error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">
              Failed to load: {error && typeof error === "object" && "message" in error  || userAddressQuery.error && typeof userAddressQuery.error === "object" && "message" in userAddressQuery.error ? (userAddressQuery.error as { message?: string }).message : undefined}
            </p>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Checkout Form */}
          <main className="col-span-12 sm:col-span-7 md:col-span-7 lg:col-span-7 space-y-4">
            <CheckoutForm 
              cart={cartData}
              userAddress={userAddress}
              phoneNumber={phoneNumber}
              onPlaceOrder={handlePlaceOrder}
              isPlacingOrder={isPlacingOrder}
              total={total}
              isValidatingCart={isValidatingCart}
              setIsValidatingCart={setIsValidatingCart}
            />
          </main>

          {/* Order Summary - Tablet+ */}
          <aside className="hidden sm:block sm:col-span-5 md:col-span-5 lg:col-span-5">
            <CheckoutSummary 
              cart={cartData}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              onPlaceOrder={handlePlaceOrder}
              isPlacingOrder={isPlacingOrder}
              isValidatingCart={isValidatingCart}
            />
          </aside>
        </div>
      </div>

      {/* Mobile Order Summary & Bottom CTA - Only for very small screens */}
      <div className="sm:hidden">
        <MobileOrderSummary
          cart={cartData}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
          isExpanded={isOrderSummaryExpanded}
          onToggleExpanded={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
          onPlaceOrder={handlePlaceOrder}
          isPlacingOrder={isPlacingOrder}
        />
      </div>
    </div>
  );
}