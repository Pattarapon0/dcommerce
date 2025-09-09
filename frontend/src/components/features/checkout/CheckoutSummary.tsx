"use client";

import Image from 'next/image';
import { CartSummaryDto } from '@/stores/cart';
import { useFormatUserPrice } from '@/hooks/useUserCurrency';

interface CheckoutSummaryProps {
  cart: CartSummaryDto | undefined;
  subtotal: number;
  tax: number;
  total: number;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
  isValidatingCart: boolean;
}

export default function CheckoutSummary({ 
  cart, 
  subtotal, 
  tax, 
  total, 
  onPlaceOrder, 
  isPlacingOrder, 
  isValidatingCart 
}: CheckoutSummaryProps) {
  const formatPrice = useFormatUserPrice();
  return (
    <div className="sticky top-8">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">ORDER SUMMARY</h2>
          <p className="text-sm text-gray-600">{cart?.TotalItems} {cart?.TotalItems === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {/* Items List - Grouped by Seller */}
        <div className="px-6 py-4 max-h-64 overflow-y-auto">
          <div className="space-y-4">
            {cart?.ItemsBySeller && Object.entries(cart.ItemsBySeller).map(([sellerId, sellerGroup]) => (
              <div key={sellerId} className="space-y-3">
                {/* Seller Header */}
                <div className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-1">
                  {sellerGroup.SellerName}
                </div>
                
                {/* Seller's Items */}
                {sellerGroup.Items?.map((item) => (
                  <div key={item.Id} className="flex items-center space-x-3">
                    <div className="relative w-12 h-12">
                      <Image 
                        src={item.ProductImageUrl || "/placeholder-product.jpg"} 
                        alt={item.ProductName || "Product"}
                        fill
                        className="object-cover rounded-lg border border-gray-200"
                        sizes="48px"
                      />
                      {(item.Quantity || 0) > 1 && (
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.Quantity}
                        </div>
                      )}
                    </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-medium text-sm truncate">{item.ProductName}</p>
                       <p className="text-xs text-gray-600">
                         {formatPrice(item.ProductPrice || 0)} × {item.Quantity}
                       </p>
                     </div>
                     <p className="font-semibold text-sm">
                       {formatPrice(item.TotalPrice || 0)}
                     </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal ({cart?.TotalItems} {cart?.TotalItems === 1 ? 'item' : 'items'})</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="tabular-nums text-green-600">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="tabular-nums">{formatPrice(tax)}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="px-6 py-4">
          <div className="flex flex-col space-y-3">
            <button
              onClick={onPlaceOrder}
              disabled={isPlacingOrder || isValidatingCart}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  Placing Order...
                </>
              ) : isValidatingCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  Validating...
                </>
               ) : (
                 `Place Order • ${formatPrice(total)}`
               )}
            </button>
            <p className="text-xs text-gray-500 text-center">
              By placing your order, you agree to our Terms & Conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}