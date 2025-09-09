"use client";

import { ProductDto } from "@/lib/api/products";
import Image from "next/image";
import { ShoppingCart, Eye,TrendingUp, Plus, Minus, Trash2,  Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeaturedCurrencyDisplay } from "./CurrencyDisplay";
import { toast } from "@/lib/toast";
import { useState } from "react";

interface FeaturedProductCardProps {
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

export function FeaturedProductCard({
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
}: FeaturedProductCardProps) {
  const [inputValid, setInputValid] = useState(true);

  const stockStatus = () => {
    const stock = product.Stock || 0;
    if (stock === 0) return { text: "Out of Stock", color: "bg-red-100 text-red-800", available: false };
    if (stock <= 3) return { text: `Only ${stock} left`, color: "bg-orange-100 text-orange-800", available: true };
    return { text: "In Stock", color: "bg-green-100 text-green-800", available: true };
  };

  const status = stockStatus();
  const isPopular = (product.SalesCount || 0) > 10;
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
    onUpdateQuantity?.(product.Id || '', numValue);
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
    <div className={`group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 transition-all duration-300 ${className}`}>
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-0">
        {/* Image Section */}
        <div className="relative aspect-[16/9] sm:aspect-[3/2] lg:aspect-[4/3] overflow-hidden bg-gray-100">
          {product.MainImage ? (
            <Image
              src={product.MainImage}
              alt={`${product.Name} - Featured product image`}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              quality={90}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-lg">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isPopular && (
              <Badge className="bg-blue-100 text-blue-800 border-0 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Popular
              </Badge>
            )}
            <Badge className={`${status.color} border-0`}>
              {status.text}
            </Badge>
          </div>

          {/* Quick View Button - Always Visible in Top Right */}
          <div className="absolute top-4 right-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onQuickView?.(product.Id || "")}
              aria-label={`Quick view ${product.Name}`}
              className="bg-white/90 hover:bg-white backdrop-blur-sm border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
          {/* Featured Label */}
          <div className="mb-3">
            <Badge variant="outline" className="text-xs font-medium">
              Featured Product
            </Badge>
          </div>

          {/* Product Name - Make it focusable and clickable */}
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
            <button 
              className="text-left w-full hover:text-blue-600 focus:text-blue-600 focus:outline-none focus:underline transition-colors py-1 min-h-[44px] sm:min-h-0 sm:py-0"
              onClick={() => onQuickView?.(product.Id || "")}
              aria-label={`View details for ${product.Name}`}
            >
              {product.Name}
            </button>
          </h2>

          {/* Description */}
          {product.Description && (
            <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
              {product.Description}
            </p>
          )}

          {/* Price */}
          <FeaturedCurrencyDisplay
            price={product.Price || 0}
            originalCurrency={product.BaseCurrency || "THB"}
            userPreferredCurrency={userCurrency}
            exchangeRates={exchangeRates}
            className="mb-4"
          />

          {/* Seller and Sales Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <span>by {product.SellerName || "Unknown Seller"}</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" />
              <span>{(product.SalesCount || 0).toLocaleString()} sold</span>
            </div>
          </div>

          {/* Actions */}
          {isInCart ? (
            <div className="space-y-3">
              {/* Quantity Controls */}
              <div className="flex items-center border rounded-lg bg-gray-50 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDecrement}
                  disabled={!canDecrease}
                  className={`h-8 w-8 sm:h-10 sm:w-10 p-0 ${!canDecrease ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <input
                  type="number"
                  value={cartQuantity}
                  onChange={handleQuantityChange}
                  className={`flex-1 text-center text-sm sm:text-base border-0 bg-transparent focus:ring-0 focus:outline-none ${
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
                  className={`h-8 w-8 sm:h-10 sm:w-10 p-0 ${!canIncrease ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleRemoveFromCart}
                  disabled={isRemovingFromCart}
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-base focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  size="lg"
                >
                  {isRemovingFromCart ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Remove
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onQuickView?.(product.Id || "")}
                  className="h-10 sm:h-12 px-4 sm:px-6 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  size="lg"
                >
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                size="lg"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => onQuickView?.(product.Id || "")}
                className="h-10 sm:h-12 px-4 sm:px-6 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                size="lg"
              >
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}