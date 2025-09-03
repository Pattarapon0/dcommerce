"use client";

import { formatCartPrice } from '@/stores/cart';

interface SellerGroupHeaderProps {
  sellerName: string;
  sellerTotal: number;
  currency?: string;
}

export default function SellerGroupHeader({ 
  sellerName, 
  sellerTotal, 
  currency = "THB" 
}: SellerGroupHeaderProps) {
  return (
    <header className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white/60">
      <div className="font-medium flex items-center gap-2">
        <span>🏪</span>
        <span>{sellerName}</span>
      </div>
      <div className="tabular-nums text-sm text-gray-600">
        Seller Total: {formatCartPrice(sellerTotal, currency)}
      </div>
    </header>
  );
}