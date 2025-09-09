"use client";

import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { cartQueryAtom, updateCartMutationAtom, removeCartMutationAtom } from '@/stores/cart';
import CartHeader from "./CartHeader";
import CartItemList from "./CartItemList";
import OrderSummary from "./OrderSummary";
import EmptyCart from "./EmptyCart";

export default function CartPageClient() {
  const router = useRouter();
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
  const tax = Math.round(subtotal * 0.10);
  const total = subtotal + shipping + tax;
  
  return (
    <div className='px-6 py-8 space-y-6'>
      <div className="max-w-6xl mx-auto px-4">
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
          
          {/* Order Summary Sidebar - Hidden on mobile */}
          <aside className="hidden md:block lg:col-span-4 md:col-span-5 lg:sticky lg:top-6 h-max">
            <OrderSummary 
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              itemCount={itemCount}
              onCheckout={() => router.push('/checkout')}
            />
          </aside>
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div className="md:hidden action-bar-hybrid px-4">
        <div className="bg-white border-t border-gray-200">
          <button 
            onClick={() => router.push('/checkout')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            🛒 Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}