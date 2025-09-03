"use client";

import { useFormatUserPrice } from '@/hooks/useUserCurrency';

interface OrderSummaryProps {
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total?: number;
  itemCount?: number;
  onCheckout?: () => void;
}

export default function OrderSummary({ 
  subtotal = 132600,
  shipping = 0,
  tax = 6630,
  total = 139230,
  itemCount = 3,
  onCheckout
}: OrderSummaryProps) {
  const formatPrice = useFormatUserPrice();
  
  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      {/* Header */}
      <h2 className="text-lg font-semibold">ORDER SUMMARY</h2>
      
      {/* Subtotal Rows */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="tabular-nums text-green-600">
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Tax</span>
          <span className="tabular-nums">{formatPrice(tax)}</span>
        </div>
      </div>
      
      {/* Total Section with visual separation */}
      <div className="border-t pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(total)}</span>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="space-y-2 pt-4">
        <button 
          onClick={onCheckout}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          🛒 Proceed to Checkout
        </button>
        
        <div className="text-center text-sm text-gray-500">
          🔒 Secure Checkout
        </div>
      </div>
      
      {/* Payment Methods */}
      <div className="text-center text-sm text-gray-600 pt-2">
        💳 We accept: Visa • Mastercard • PayPal
      </div>
    </div>
  );
}