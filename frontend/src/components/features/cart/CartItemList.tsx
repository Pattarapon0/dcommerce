"use client";

import { CartSummaryDto } from '@/stores/cart';
import SellerGroupHeader from './SellerGroupHeader';
import CartItem from './CartItem';

interface CartItemListProps {
  cart: CartSummaryDto;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export default function CartItemList({ cart, onQuantityChange, onRemoveItem }: CartItemListProps) {
  if (!cart.ItemsBySeller || Object.keys(cart.ItemsBySeller).length === 0) {
    return null;
  }

  const getSellerTotal = (sellerGroup: any) => {
    // Try SellerTotal first (correct backend property), then Total (fallback), then calculate from items
    return sellerGroup.SellerTotal ?? 
           sellerGroup.Total ?? 
           sellerGroup.Items?.reduce((sum: number, item: any) => sum + (item.TotalPrice || 0), 0) ?? 
           0;
  };

  return (
    <div className="space-y-3 max-w-3xl">
      {Object.entries(cart.ItemsBySeller).map(([sellerId, sellerGroup]) => (
        <div key={sellerId} className="space-y-3">
          <SellerGroupHeader 
            sellerName={sellerGroup.SellerName || "Unknown Seller"}
            sellerTotal={getSellerTotal(sellerGroup)}
          />
          
          {sellerGroup.Items?.map((item) => (
            <CartItem
              key={item.Id}
              item={item}
              onQuantityChange={onQuantityChange}
              onRemove={onRemoveItem}
            />
          ))}
        </div>
      ))}
    </div>
  );
}