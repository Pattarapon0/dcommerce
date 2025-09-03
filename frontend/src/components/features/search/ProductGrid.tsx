"use client";

import { ProductDto } from "@/lib/api/products";
import { CustomerProductCard } from "@/components/features/products/CustomerProductCard";
import { FeaturedProductCard } from "./FeaturedProductCard";
import { ProductGridSkeleton } from "./ProductGridSkeleton";
import { EmptyState } from "./EmptyState";

interface ProductGridProps {
  products: ProductDto[];
  loading?: boolean;
  error?: string;
  onAddToCart?: (productId: string, quantity?: number) => void;
  onUpdateQuantity?: (productId: string, newQuantity: number) => void;
  onRemoveFromCart?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  userCurrency?: string;
  exchangeRates?: { [key: string]: number } | undefined;
  getCartQuantity?: (productId: string) => number;
  isProductInCart?: (productId: string) => boolean;
  isAddingToCart?: boolean;
  isUpdatingCart?: boolean;
  isRemovingFromCart?: boolean;
}

export function ProductGrid({
  products,
  loading = false,
  error,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onQuickView,
  userCurrency = "THB",
  exchangeRates,
  getCartQuantity,
  isProductInCart,
  isAddingToCart,
  isUpdatingCart,
  isRemovingFromCart
}: ProductGridProps) {
  // Show loading state
  if (loading) {
    return <ProductGridSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <EmptyState
        type="error"
        title="Something went wrong"
        description={error}
        actionText="Try again"
        onAction={() => window.location.reload()}
      />
    );
  }

  // Show empty state
  if (products.length === 0) {
    return (
      <EmptyState
        type="no-results"
        title="No products found"
        description="Try adjusting your search or filters"
      />
    );
  }

  // Determine featured product (first product with high sales or newest)
  const featuredProduct = products.find(p => 
    (p.SalesCount || 0) > 10 || 
    new Date(p.CreatedAt || "").getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ) || products[0];

  const regularProducts = products.filter(p => p.Id !== featuredProduct?.Id);

  return (
    <div className="space-y-6" role="main" aria-label="Product search results">
      {/* Featured Product - Only show if we have products */}
      {featuredProduct && products.length > 3 && (
        <div className="mb-8" role="region" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="sr-only">Featured product</h2>
          <FeaturedProductCard
            product={featuredProduct}
            onAddToCart={onAddToCart}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveFromCart={onRemoveFromCart}
            onQuickView={onQuickView}
            userCurrency={userCurrency}
            exchangeRates={exchangeRates}
            cartQuantity={getCartQuantity?.(featuredProduct.Id || '') || 0}
            isInCart={isProductInCart?.(featuredProduct.Id || '') || false}
            isAddingToCart={isAddingToCart}
            isUpdatingCart={isUpdatingCart}
            isRemovingFromCart={isRemovingFromCart}
          />
        </div>
      )}

      {/* Regular Product Grid */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        role="region"
        aria-label={`Product grid with ${(featuredProduct && products.length > 3 ? regularProducts : products).length} products`}
      >
        {(featuredProduct && products.length > 3 ? regularProducts : products).map((product) => (
          <CustomerProductCard
            key={product.Id}
            product={product}
            onAddToCart={onAddToCart}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveFromCart={onRemoveFromCart}
            onQuickView={onQuickView}
            userCurrency={userCurrency}
            exchangeRates={exchangeRates}
            cartQuantity={getCartQuantity?.(product.Id || '') || 0}
            isInCart={isProductInCart?.(product.Id || '') || false}
            isAddingToCart={isAddingToCart}
            isUpdatingCart={isUpdatingCart}
            isRemovingFromCart={isRemovingFromCart}
          />
        ))}
      </div>
    </div>
  );
}