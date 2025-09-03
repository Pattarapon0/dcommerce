"use client";

import { useFormatUserPrice } from '@/hooks/useUserCurrency';

interface SellerGroupHeaderProps {
  sellerName: string;
  sellerTotal: number;
}

export default function SellerGroupHeader({ 
  sellerName, 
  sellerTotal
}: SellerGroupHeaderProps) {
  const formatPrice = useFormatUserPrice();
  
  return (
    <header className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white/60">
      <div className="font-medium flex items-center gap-2">
        <span>🏪</span>
        <span>{sellerName}</span>
      </div>
      <div className="tabular-nums text-sm text-gray-600">
        Seller Total: {formatPrice(sellerTotal)}
      </div>
    </header>
  );
}