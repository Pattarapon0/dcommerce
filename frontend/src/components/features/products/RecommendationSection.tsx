"use client";

import { ProductDto } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { ChevronRight, Store } from "lucide-react";
import { CustomerProductCard } from "./CustomerProductCard";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RecommendationSectionProps {
  title: string;
  products: ProductDto[];
  showViewAll?: boolean;
  showStoreButton?: boolean;
  sellerName?: string;
  className?: string;
  userCurrency?: string; 
  exchangeRates?: Record<string, number>;
  onAddToCart?: (productId: string, quantity?: number) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemoveFromCart?: (productId: string) => void;
  getCartQuantity?: (productId: string) => number;
  isProductInCart?: (productId: string) => boolean;
  isAddingToCart?: boolean;
  isUpdatingCart?: boolean;
  isRemovingFromCart?: boolean;
}

export default function RecommendationSection({
  title,
  products,
  showViewAll = false,
  showStoreButton = false,
  sellerName,
  className = "",
  userCurrency,
  onAddToCart,
  exchangeRates,
  onUpdateQuantity,
  onRemoveFromCart,
  getCartQuantity,
  isProductInCart,
  isAddingToCart,
  isUpdatingCart,
  isRemovingFromCart
}: RecommendationSectionProps) {
  const [showExpandedRecommendations, setShowExpandedRecommendations] = useState(false);
  const router = useRouter();

  const handleAddToCart = (productId: string, quantity: number = 1) => {
    onAddToCart?.(productId, quantity);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    onUpdateQuantity?.(productId, quantity);
  };

  const handleRemoveFromCart = (productId: string) => {
    onRemoveFromCart?.(productId);
  };

  const handleQuickView = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  // Mock additional recommendation sections for the collapsed/expanded feature
  const additionalSections = [
    {
      title: "Top Selling in Electronics",
      products: products.slice(0, 2)
    },
    {
      title: "Similar Price Range",
      products: products.slice(1, 3)
    },
    {
      title: "Recently Added",
      products: products.slice(2, 4)
    }
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Main Recommendation Section */}
      <div className="px-4 xl:px-0">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {showStoreButton && sellerName && (
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Store className="h-4 w-4 mr-2" />
                Visit Store
              </Button>
            )}
          </div>
          
          {showViewAll && (
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <CustomerProductCard
              key={product.Id}
              product={product}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onQuickView={handleQuickView}
              userCurrency={userCurrency}
              exchangeRates={exchangeRates}
              cartQuantity={product.Id && getCartQuantity ? getCartQuantity(product.Id) : 0}
              isInCart={product.Id && isProductInCart ? isProductInCart(product.Id) : false}
              isAddingToCart={isAddingToCart || false}
              isUpdatingCart={isUpdatingCart || false}
              isRemovingFromCart={isRemovingFromCart || false}
            />
          ))}
        </div>

        {/* Mobile Store Button */}
        {showStoreButton && sellerName && (
          <div className="sm:hidden mt-6">
            <Button variant="outline" className="w-full">
              <Store className="h-4 w-4 mr-2" />
              Visit {sellerName}&apos;s Store
            </Button>
          </div>
        )}
      </div>

      {/* Collapsed Recommendations Section */}
      {title === "Related Products" && (
        <div className="px-4 xl:px-0">
          <div className="border-t pt-6">
            {!showExpandedRecommendations ? (
              <Button
                variant="outline"
                onClick={() => setShowExpandedRecommendations(true)}
                className="w-full h-12 text-base font-medium"
              >
                More Recommendations
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            ) : (
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">More Recommendations</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExpandedRecommendations(false)}
                      className="text-gray-600"
                    >
                      Collapse
                    </Button>
                  </div>

                  {additionalSections.map((section, index) => (
                    <div key={index}>
                      <h4 className="text-md font-medium text-gray-800 mb-4">{section.title}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {section.products.map((product) => (
                        <CustomerProductCard
                          key={`${section.title}-${product.Id}`}
                          product={product}
                          onAddToCart={handleAddToCart}
                          onUpdateQuantity={handleUpdateQuantity}
                          onRemoveFromCart={handleRemoveFromCart}
                          onQuickView={handleQuickView}
                          userCurrency={userCurrency}
                          exchangeRates={exchangeRates}
                          cartQuantity={product.Id && getCartQuantity ? getCartQuantity(product.Id) : 0}
                          isInCart={product.Id && isProductInCart ? isProductInCart(product.Id) : false}
                          isAddingToCart={isAddingToCart || false}
                          isUpdatingCart={isUpdatingCart || false}
                          isRemovingFromCart={isRemovingFromCart || false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}