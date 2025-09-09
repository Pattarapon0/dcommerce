"use client";

import { ProductDto } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Share, ShoppingCart, Zap, Truck, RotateCcw, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import ProductBadge from "./ProductBadge";
import { FeaturedCurrencyDisplay } from "@/components/features/search/CurrencyDisplay";
import { toast } from "@/lib/toast";
import { useState, useCallback } from "react";

interface ProductInfoProps {
  product: ProductDto;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onShare: () => void;
  isProductInCart: (productId: string) => boolean;
  getProductQuantity: (productId: string) => number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  userCurrency?: string;
  exchangeRates?: Record<string, number>;
}

export default function ProductInfo({
  product,
  onAddToCart,
  onBuyNow,
  onShare,
  isProductInCart,
  getProductQuantity,
  onUpdateQuantity,
  onRemoveFromCart,
  isAdding,
  isUpdating,
  isRemoving,
  userCurrency = "THB",
  exchangeRates
}: ProductInfoProps) {
  const [inputValid, setInputValid] = useState(true);
  
  const isOutOfStock = !product.Stock || product.Stock === 0;
  const productId = product.Id || '';
  const isInCart = isProductInCart(productId);
  const currentQuantity = getProductQuantity(productId);
  const maxStock = product.Stock || 0;
  
  const canDecrease = currentQuantity > 1 && !isUpdating;
  const canIncrease = currentQuantity < maxStock && !isUpdating;
  const canAddToCart = maxStock > 0 && !isAdding;

  const handleQuantityInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value);
    
    if (value === '' || isNaN(numValue)) {
      setInputValid(false);
      return;
    }
    
    if (numValue < 1) {
      setInputValid(false);
      toast.error('Minimum quantity is 1');
      return;
    }
    
    if (numValue > maxStock) {
      setInputValid(false);
      toast.error(`Only ${maxStock} available in stock`);
      return;
    }
    
    setInputValid(true);
    onUpdateQuantity(productId, numValue);
  }, [productId, maxStock, onUpdateQuantity]);

  const handleIncrement = useCallback(() => {
    if (currentQuantity >= maxStock) {
      toast.error(`Maximum ${maxStock} items available`);
      return;
    }
    onUpdateQuantity(productId, currentQuantity + 1);
  }, [currentQuantity, maxStock, productId, onUpdateQuantity]);

  const handleDecrement = useCallback(() => {
    if (currentQuantity <= 1) {
      toast.error('Minimum quantity is 1');
      return;
    }
    onUpdateQuantity(productId, currentQuantity - 1);
  }, [currentQuantity, productId, onUpdateQuantity]);

  const handleRemoveFromCart = useCallback(() => {
    onRemoveFromCart(productId);
  }, [productId, onRemoveFromCart]);

  return (
    <div className="xl:sticky xl:top-6 space-y-4">
      {/* Product Title */}
      <div>
        <h1 className="text-lg xl:text-xl font-bold text-gray-900 leading-tight">
          {product.Name || "Product Name"}
        </h1>
      </div>

      {/* Seller Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">by</span>
          <button className="text-xs font-medium text-blue-600 hover:text-blue-700 underline">
            {product.SellerName || "Unknown Seller"}
          </button>
          <div className="flex items-center gap-1 ml-2 text-xs text-gray-500">
            <span>Sales: {product.SalesCount?.toLocaleString() || 0}</span>
          </div>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden xl:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="h-8 w-8"
            aria-label="Share product"
          >
            <Share className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Badge */}
      <ProductBadge product={product} />

      {/* Price */}
      <FeaturedCurrencyDisplay
        price={product.Price || 0}
        originalCurrency={product.BaseCurrency || "THB"}
        userPreferredCurrency={userCurrency}
        exchangeRates={exchangeRates}
        className="mb-4"
      />

      {/* Key Benefits */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Truck className="h-3 w-3" />
          <span>Free delivery</span>
        </div>
        <div className="flex items-center gap-1">
          <RotateCcw className="h-3 w-3" />
          <span>30-day returns</span>
        </div>
      </div>

      {/* Stock Status */}
      <div className="text-xs">
        {isOutOfStock ? (
          <span className="text-red-600 font-medium">Out of Stock</span>
        ) : (
          <span className="text-green-600 font-medium">
            {product.Stock! > 10 ? "In Stock" : `Only ${product.Stock} left in stock`}
          </span>
        )}
      </div>

      {/* Desktop Action Buttons */}
      <div className="hidden xl:block space-y-3">
        {isInCart ? (
            <div className="space-y-3">
             {/* Quantity Controls */}
             <div className="flex items-center border rounded-lg bg-gray-50 p-1">
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleDecrement}
                 disabled={!canDecrease}
                 className={`h-8 w-8 p-0 ${!canDecrease ? 'opacity-50 cursor-not-allowed' : ''}`}
                 aria-label="Decrease quantity"
               >
                 <Minus className="h-3 w-3" />
               </Button>
               
               <input
                 type="number"
                 value={currentQuantity}
                 onChange={handleQuantityInputChange}
                 className={`flex-1 text-center text-sm border-0 bg-transparent focus:ring-0 focus:outline-none ${
                   !inputValid ? 'text-red-600' : ''
                 }`}
                 min="1"
                 max={maxStock}
                 aria-label={`Quantity for ${product.Name}`}
               />
               
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleIncrement}
                 disabled={!canIncrease}
                 className={`h-8 w-8 p-0 ${!canIncrease ? 'opacity-50 cursor-not-allowed' : ''}`}
                 aria-label="Increase quantity"
               >
                 <Plus className="h-3 w-3" />
               </Button>
             </div>
             
             {/* Action Buttons */}
             <div className="space-y-2">
               <Button
                 variant="outline"
                 onClick={handleRemoveFromCart}
                 disabled={isRemoving}
                 className="w-full h-9 text-sm font-medium"
                 size="sm"
               >
                 {isRemoving ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Removing...
                   </>
                 ) : (
                   <>
                     <Trash2 className="h-4 w-4 mr-2" />
                     Remove from Cart
                   </>
                 )}
               </Button>
               
               <Button
                 onClick={onBuyNow}
                 disabled={isOutOfStock}
                 className="w-full h-9 text-sm font-medium"
                 size="sm"
               >
                 <Zap className="h-4 w-4 mr-2" />
                 Buy Now
               </Button>
             </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={onAddToCart}
              disabled={!canAddToCart}
              className="w-full h-9 text-sm font-medium"
              size="sm"
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
            
            <Button
              onClick={onBuyNow}
              disabled={isOutOfStock}
              variant="outline"
              className="w-full h-9 text-sm font-medium"
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Buy Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}