"use client";

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { CartSummaryDto } from '@/stores/cart';
import { useFormatUserPrice } from '@/hooks/useUserCurrency';

interface MobileOrderSummaryProps {
  cart: CartSummaryDto | undefined;
  subtotal: number;
  tax: number;
  total: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
}

export default function MobileOrderSummary({ 
  cart, 
  subtotal,  
  tax, 
  total, 
  isExpanded, 
  onToggleExpanded, 
  onPlaceOrder,
  isPlacingOrder 
}: MobileOrderSummaryProps) {
  const formatPrice = useFormatUserPrice();
  return (
    <div className="action-bar-hybrid">
      {/* Collapsible Order Summary */}
      <div 
        className={`bg-white border-t border-gray-200 transition-all duration-200 ease-in-out ${
          isExpanded ? 'h-[60vh]' : 'h-auto'
        }`}
      >
        {/* Summary Header - Always Visible */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={onToggleExpanded}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h3 className="font-semibold">Order Summary</h3>
              <p className="text-sm text-gray-600">{cart?.TotalItems} items</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold">{formatPrice(total)}</span>
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="p-4 space-y-4 max-h-[calc(60vh-140px)] overflow-y-auto">
            {/* Items List - Grouped by Seller */}
            <div className="space-y-3">
              {cart?.ItemsBySeller && Object.entries(cart.ItemsBySeller).map(([sellerId, sellerGroup]) => (
                <div key={sellerId} className="space-y-2">
                  {/* Seller Header */}
                  <div className="text-xs font-medium text-gray-700 border-b border-gray-100 pb-1">
                    {sellerGroup.SellerName}
                  </div>
                  
                  {/* Seller's Items */}
                  {sellerGroup.Items?.map((item) => (
                    <div key={item.Id} className="flex items-center space-x-3">
                      <div className="relative w-10 h-10">
                        <Image 
                          src={item.ProductImageUrl || "/placeholder-product.jpg"} 
                          alt={item.ProductName || "Product"}
                          fill
                          className="object-cover rounded-lg border border-gray-200"
                          sizes="40px"
                        />
                        {(item.Quantity || 0) > 1 && (
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
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

            {/* Totals */}
            <div className="border-t border-gray-100 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
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
              </div>
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA with proper safe area handling */}
        <div className="action-bar-hybrid-content bg-white border-t border-gray-100">
          <Button
            onClick={onPlaceOrder}
            disabled={isPlacingOrder}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlacingOrder ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Placing Order...
              </div>
            ) : (
              `🛒 Place Order — ${formatPrice(total)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}