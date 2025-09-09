"use client";

import { useFormatUserPrice } from '@/hooks/useUserCurrency';
import type { OrderDto } from '@/lib/api/orders';

interface OrderSummaryProps {
  order: OrderDto;
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  const formatUserPrice = useFormatUserPrice();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatUserPrice(order.SubTotal || 0)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>{formatUserPrice(order.Tax || 0)}</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{formatUserPrice(order.Total || 0)}</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mt-2">
          Currency: {order.Currency}
        </div>
      </div>
    </div>
  );
}