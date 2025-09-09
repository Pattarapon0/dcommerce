"use client";

import Image from 'next/image';
import { Package, Truck, CheckCircle2, Clock, XCircle, Store } from 'lucide-react';
import { useFormatUserPrice } from '@/hooks/useUserCurrency';
import type { OrderDto } from '@/lib/api/orders';
import type { components } from '@/lib/types/api';

type OrderItemStatus = components["schemas"]["OrderItemStatus"];

interface OrderItemsListProps {
  order: OrderDto;
}

// Basic seller data - only what exists in real API
const mockSellers = {
  "550e8400-e29b-41d4-a716-446655440030": { 
    name: "TechGear Store"
  },
  "550e8400-e29b-41d4-a716-446655440031": { 
    name: "Premium Electronics"
  },
  "550e8400-e29b-41d4-a716-446655440032": { 
    name: "Home & Garden Co"
  }
};

const getStatusBadge = (status: OrderItemStatus) => {
  const configs = {
    'Pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'Processing': { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
    'Shipped': { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
    'Delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    'Cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
  };
  
  const config = configs[status] || configs['Pending'];
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

export default function OrderItemsList({ order }: OrderItemsListProps) {
  const formatUserPrice = useFormatUserPrice();

  // Group items by seller - REAL WORLD PATTERN
  const itemsBySeller = (order.OrderItems || []).reduce((acc, item) => {
    const sellerId = item.SellerId || 'unknown';
    if (!acc[sellerId]) {
      acc[sellerId] = [];
    }
    acc[sellerId].push(item);
    return acc;
  }, {} as Record<string, typeof order.OrderItems>);

  return (
    <div className="space-y-4 mb-6">
      {Object.entries(itemsBySeller).map(([sellerId, sellerItems]) => {
        const seller = mockSellers[sellerId as keyof typeof mockSellers];
        const sellerTotal = (sellerItems ?? []).reduce((sum, item) => sum + (item.LineTotal || 0), 0);
        
        return (
          <div key={sellerId} className="bg-white rounded-lg border">
            {/* Seller Header - Basic info only */}
            <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Store className="h-4 w-4 text-gray-500" />
                <div>
                  <h3 className="font-medium text-sm">{seller?.name || 'Unknown Seller'}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatUserPrice(sellerTotal)}</p>
                <p className="text-xs text-gray-500">{sellerItems?.length ?? 0} items</p>
              </div>
            </div>

            {/* Better scrolling for long lists */}
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y">
                {(sellerItems ?? []).map((item) => (
                  <div key={item.Id} className="p-3 flex items-center gap-3 hover:bg-gray-50">
                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.ProductImageUrl || '/placeholder-product.jpg'}
                        alt={item.ProductName || ''}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                        {item.ProductName}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {formatUserPrice(item.PriceAtOrderTime ?? 0)} × {item.Quantity}
                      </p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className="mb-1">
                        {getStatusBadge(item.Status as OrderItemStatus)}
                      </div>
                      <p className="text-sm font-medium">
                        {formatUserPrice(item.LineTotal ?? 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Show count if many items */}
              {(sellerItems ?? []).length > 10 && (
                <div className="p-2 text-center border-t bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Showing all {sellerItems?.length ?? 0} items from {seller?.name}
                  </p>
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}