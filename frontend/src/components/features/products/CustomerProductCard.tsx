"use client";

import { ProductDto } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils/currency";
import Image from "next/image";
import { ShoppingCart, Eye, Star, Plus, Minus, Trash2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from "@/components/features/search/CurrencyDisplay";
import { toast } from "@/lib/toast";
import { useState, useCallback, useRef, useEffect } from "react";

interface CustomerProductCardProps {
  product: ProductDto;
  onAddToCart?: (productId: string, quantity?: number) => void;
  onUpdateQuantity?: (productId: string, newQuantity: number) => void;
  onRemoveFromCart?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  userCurrency?: string;
  exchangeRates?: Record<string, number>;
  className?: string;
  cartQuantity?: number;
  isInCart?: boolean;
  isAddingToCart?: boolean;
  isUpdatingCart?: boolean;
  isRemovingFromCart?: boolean;
}

export function CustomerProductCard({
  product,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onQuickView,
  userCurrency = "THB",
  exchangeRates,
  className = "",
  cartQuantity = 0,
  isInCart = false,
  isAddingToCart = false,
  isUpdatingCart = false,
  isRemovingFromCart = false
}: CustomerProductCardProps) {
  const [inputValid, setInputValid] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update function for input changes only
  const debouncedUpdate = useCallback((productId: string, quantity: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onUpdateQuantity?.(productId, quantity);
    }, 500);
  }, [onUpdateQuantity]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const stockStatus = () => {
    const stock = product.Stock || 0;
    if (stock === 0) return { text: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (stock <= 3) return { text: `Only ${stock} left`, color: "bg-orange-100 text-orange-800" };
    return { text: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const status = stockStatus();
  const maxStock = product.Stock || 0;
  const canDecrease = cartQuantity > 1 && !isUpdatingCart;
  const canIncrease = cartQuantity < maxStock && !isUpdatingCart;
  const canAddToCart = maxStock > 0 && !isAddingToCart;


  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    debouncedUpdate(product.Id || '', numValue);
  };

  const handleIncrement = () => {
    if (cartQuantity >= maxStock) {
      toast.error(`Maximum ${maxStock} items available`);
      return;
    }
    
    onUpdateQuantity?.(product.Id || '', cartQuantity + 1);
  };

  const handleDecrement = () => {
    if (cartQuantity <= 1) {
      toast.error('Minimum quantity is 1');
      return;
    }
    
    onUpdateQuantity?.(product.Id || '', cartQuantity - 1);
  };

  const handleAddToCart = () => {
    onAddToCart?.(product.Id || '', 1);
  };

  const handleRemoveFromCart = () => {
    onRemoveFromCart?.(product.Id || '');
  };

  return (
    <div className={`group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 transition-all duration-200 ${className}`}>
      {/* Product Image - Responsive aspect ratios matching main product */}
      <div className="relative aspect-[5/3] md:aspect-[7/3] xl:aspect-[3/2] overflow-hidden bg-gray-100">
        {product.MainImage ? (
          <Image
            src={product.MainImage}
            alt={`${product.Name} - Product image`}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 280px"
            loading="lazy"
            quality={85}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Stock Status Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={`text-xs ${status.color} border-0`}>
            {status.text}
          </Badge>
        </div>

        {/* Quick View Button - Always Visible */}
        <div className="absolute top-2 right-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onQuickView?.(product.Id || "")}
            aria-label={`Quick view ${product.Name}`}
            className="bg-white/90 hover:bg-white backdrop-blur-sm border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 min-h-[44px] min-w-[44px]"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Product Name - Make it focusable and clickable */}
        <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
          <button 
            className="text-left w-full hover:text-blue-600 focus:text-blue-600 focus:outline-none focus:underline transition-colors py-1 min-h-[44px] sm:min-h-0 sm:py-0"
            onClick={() => onQuickView?.(product.Id || "")}
            aria-label={`View details for ${product.Name}`}
          >
            {product.Name}
          </button>
        </h3>

        {/* Price Display */}
        <CurrencyDisplay
          price={product.Price || 0}
          originalCurrency={product.BaseCurrency || "THB"}
          userPreferredCurrency={userCurrency}
          exchangeRates={exchangeRates}
          className="mb-2"
        />

        {/* Seller and Sales Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="truncate">{product.SellerName || "Unknown Seller"}</span>
          <span className="flex items-center gap-1 ml-2">
            <ShoppingCart className="h-3 w-3" />
            {(product.SalesCount || 0).toLocaleString()} sold
          </span>
        </div>

        {/* Cart Controls or Add to Cart Button */}
        {isInCart ? (
          <div className="space-y-2">
            {/* Compact Quantity Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 border rounded-md bg-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDecrement}
                  disabled={!canDecrease}
                  className="h-7 w-7 p-0"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <input
                  type="number"
                  value={cartQuantity}
                  onChange={handleQuantityChange}
                  className={`w-10 text-center text-sm border-0 bg-transparent focus:ring-0 focus:outline-none ${
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
                  className="h-7 w-7 p-0"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFromCart}
                disabled={isRemovingFromCart}
                className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                aria-label={`Remove ${product.Name} from cart`}
              >
                {isRemovingFromCart ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
            
            {/* In Cart Indicator */}
            <div className="flex items-center justify-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" />
              <span>In Cart</span>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            aria-label={`Add ${product.Name} to cart - ${formatCurrency(product.Price || 0, product.BaseCurrency || "USD")}`}
            className="w-full focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 min-h-[44px]"
            size="sm"
          >
            {isAddingToCart ? (
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
        )}
      </div>
    </div>
  );
}