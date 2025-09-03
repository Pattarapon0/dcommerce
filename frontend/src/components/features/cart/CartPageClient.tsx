"use client";

import { useAtom } from 'jotai';
import { cartQueryAtom, updateCartMutationAtom, removeCartMutationAtom, CartSummaryDto, CartItemDto } from '@/stores/cart';
import CartHeader from "./CartHeader";
import CartItemList from "./CartItemList";
import OrderSummary from "./OrderSummary";
import EmptyCart from "./EmptyCart";

export default function CartPageClient() {
  const [cartQuery] = useAtom(cartQueryAtom);
  const [updateCartMutation] = useAtom(updateCartMutationAtom);
  const [removeCartMutation] = useAtom(removeCartMutationAtom);

  const cart = cartQuery.data;
  const isLoading = cartQuery.isLoading;
  const error = cartQuery.error;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateCartMutation.mutate({
      cartItemId: itemId,
      data: { Quantity: newQuantity }
    });
  };

  const handleRemoveItem = (itemId: string) => {
    removeCartMutation.mutate(itemId);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Failed to load cart. Please try again.
        </div>
      </div>
    );
  }

  if (!cart || !cart.Items || cart.Items.length === 0) {
    return <EmptyCart />;
  }

  const itemCount = cart.TotalItems || cart.Items.length || 0;
  const subtotal = cart.TotalAmount || 0;
  const shipping = 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;
  
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-4">
        <CartHeader itemCount={itemCount} />
        
        <div className="grid grid-cols-12 gap-6">
          {/* Cart Items Section */}
          <section className="col-span-12 lg:col-span-8 md:col-span-7 space-y-3">
            <CartItemList 
              cart={cart}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
            />
          </section>
          
          {/* Order Summary Sidebar */}
          <aside className="col-span-12 lg:col-span-4 md:col-span-5 lg:sticky lg:top-6 h-max">
            <OrderSummary 
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              itemCount={itemCount}
            />
          </aside>
        </div>
      </div>

      {/* Fixed Bottom CTA (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t sm:hidden">
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          🛒 Proceed to Checkout
        </button>
      </div>
    </>
  );
}