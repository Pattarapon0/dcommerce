"use client";

import { MapPin } from 'lucide-react';
import type { OrderDto } from '@/lib/api/orders';

interface ShippingInfoProps {
  order: OrderDto;
}

export default function ShippingInfo({ order }: ShippingInfoProps) {
  const addressLines = order.ShippingAddressSnapshot?.split('\n').filter(line => line.trim()) || [];

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-4 w-4 text-gray-500" />
        <h3 className="font-semibold">Shipping Address</h3>
      </div>
      
      <div className="space-y-1 text-sm">
        {addressLines.map((line, index) => (
          <p key={index} className="text-gray-700">{line}</p>
        ))}
      </div>
    </div>
  );
}