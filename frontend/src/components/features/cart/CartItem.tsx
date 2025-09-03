"use client";

import Image from "next/image";
import Link from "next/link";
import { CartItemDto, formatCartPrice } from '@/stores/cart';
import QuantityController from './QuantityController';
import RemoveButton from './RemoveButton';

interface CartItemProps {
  item: CartItemDto;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  currency?: string;
}

export default function CartItem({ 
  item, 
  onQuantityChange, 
  onRemove, 
  currency = "THB" 
}: CartItemProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (item.Id) {
      onQuantityChange(item.Id, newQuantity);
    }
  };

  const handleRemove = () => {
    if (item.Id) {
      onRemove(item.Id);
    }
  };

  const unitPrice = item.ProductPrice || 0;
  const quantity = item.Quantity || 1;
  const subtotal = item.TotalPrice || (unitPrice * quantity);
  const availableStock = item.AvailableStock || 0;
  const productName = item.ProductName || "Unknown Product";
  const sellerName = item.SellerName || "Unknown Seller";

  return (
    <article className="flex gap-4 p-3 border rounded-xl bg-white">
      {/* Column A: Product Image */}
      <div className="flex-shrink-0">
        <Image
          src={item.ProductImageUrl || "/placeholder-product.svg"}
          alt={productName}
          width={120}
          height={120}
          className="w-[120px] h-[120px] md:w-[100px] md:h-[100px] sm:w-[80px] sm:h-[80px] rounded-lg object-cover hover:scale-[1.02] transition-transform cursor-pointer"
        />
      </div>

      {/* Column B: All Product Information + Pricing */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Top: Product Info */}
        <div>
          <div className="flex items-start justify-between">
            <Link 
              href={`/products/${item.ProductId}`}
              className="font-medium line-clamp-2 pr-4 hover:text-blue-600 transition-colors flex-1"
            >
              {productName}
            </Link>
            <RemoveButton 
              onClick={handleRemove}
              productName={productName}
            />
          </div>
          
          <div className="text-sm text-gray-600 mt-1">
            By: {sellerName}
          </div>
          
          <div className="text-sm text-gray-500 mt-1">
            {availableStock > 0 ? (
              `In Stock: ${availableStock} available`
            ) : (
              <span className="text-red-500">Out of Stock</span>
            )}
          </div>
        </div>

        {/* Bottom: Pricing & Controls */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="tabular-nums text-sm text-gray-700">
              {formatCartPrice(unitPrice, currency)} each
            </span>
            <QuantityController
              value={quantity}
              onChange={handleQuantityChange}
              min={1}
              max={Math.min(availableStock, 99)}
              disabled={availableStock === 0}
            />
          </div>
          
          <div className="tabular-nums font-semibold text-lg">
            {formatCartPrice(subtotal, currency)}
          </div>
        </div>
      </div>
    </article>
  );
}