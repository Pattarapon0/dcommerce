"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { useGetProductById, useGetRelatedProducts, useGetSellerProducts } from "@/hooks/useProduct";
import ProductHeader from "./ProductHeader";
import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import ProductContent from "./ProductContent";
import RecommendationSection from "./RecommendationSection";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Plus, Minus, Loader2, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/lib/toast";
import { useAuth } from "@/hooks/useAuth";
import { useAtomValue } from "jotai";
import { exchangeRateAtom } from "@/stores/exchageRate";

interface ProductPageClientProps {
  productId: string;
}

function ProductPageSkeleton() {
  return (
    <PageLayout className="bg-white">
      <div className="animate-pulse">
        {/* Mobile & Tablet Header Skeleton */}
        <div className="xl:hidden h-12 bg-gray-200 mb-3"></div>
        
        {/* Main Content Skeleton */}
        <div className="xl:container xl:mx-auto xl:px-6 xl:py-4">
          <div className="xl:grid xl:grid-cols-12 xl:gap-6 xl:max-w-5xl xl:mx-auto px-6 xl:px-0">
            {/* Image Gallery Skeleton */}
            <div className="xl:col-span-7">
              <div className="aspect-[5/3] md:aspect-[7/3] xl:aspect-[3/2] bg-gray-200 rounded-lg"></div>
            </div>
            
            {/* Product Info Skeleton */}
            <div className="xl:col-span-5 px-4 xl:px-0 mt-3 xl:mt-0">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-9 bg-gray-200 rounded w-full"></div>
                <div className="h-9 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="mt-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
          
          {/* Recommendations Skeleton */}
          <div className="mt-4 space-y-4">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function ProductNotFound() {
  return (
    <PageLayout className="bg-white">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    </PageLayout>
  );
}

export default function ProductPageClient({ productId }: ProductPageClientProps) {
  const { userProfile } = useAuth();
  const exchangeRateQuery = useAtomValue(exchangeRateAtom);
  
  // Fetch main product data
  const { data: product, isLoading: productLoading, isError: productError } = useGetProductById(productId);
  
  // Fetch related products (only when we have the main product)
  const { data: relatedProducts = [], isLoading: relatedLoading } = useGetRelatedProducts(
    productId, 
    4
  );
  
  // Fetch seller products (only when we have the product data)
  const { data: sellerProductsResult, isLoading: sellerLoading } = useGetSellerProducts(
    product?.SellerId || "",
    !!product?.SellerId
  );
  
  const sellerProducts = sellerProductsResult?.Items || [];

  // Enrich seller products with seller name from main product
  const enrichedSellerProducts = sellerProducts.map(sellerProduct => ({
    ...sellerProduct,
    SellerName: sellerProduct.SellerName || product?.SellerName || "Unknown Seller"
  }));

  // Get user's preferred currency, default to THB (base currency)
  const userCurrency = userProfile?.PreferredCurrency || "THB";
  const exchangeRates = exchangeRateQuery.data?.Rates;

  // Cart functionality
  const { 
    addToCart, 
    updateQuantity, 
    removeItem, 
    isProductInCart, 
    getProductQuantity, 
    findCartItem,
    isAdding,
    isUpdating,
    isRemoving 
  } = useCart();

  const handleAddToCart = useCallback((productId?: string, quantity: number = 1) => {
    const targetProductId = productId || product?.Id;
    if (!targetProductId || !product) return;
    
    const currentQuantity = getProductQuantity(targetProductId);
    const maxStock = product.Stock || 0;
    
    // Validate stock availability
    if (currentQuantity + quantity > maxStock) {
      toast.error(`Only ${maxStock} available in stock`);
      return;
    }
    
    addToCart({ ProductId: targetProductId, Quantity: quantity });
  }, [addToCart, product, getProductQuantity]);

  const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
    const targetProduct = productId === product?.Id ? product : 
      [...relatedProducts, ...enrichedSellerProducts].find(p => p.Id === productId);
    const cartItem = findCartItem(productId);
    
    if (!targetProduct || !cartItem) {
      return;
    }
    
    const maxStock = targetProduct.Stock || 0;
    
    // Validate quantity
    if (newQuantity < 1) {
      toast.error('Minimum quantity is 1');
      return;
    }
    
    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} available in stock`);
      return;
    }
    
    updateQuantity(cartItem.Id!, newQuantity);
  }, [updateQuantity, product, relatedProducts, enrichedSellerProducts, findCartItem]);

  const handleRemoveFromCart = useCallback((productId: string) => {
    const cartItem = findCartItem(productId);
    if (cartItem) {
      removeItem(cartItem.Id || '');
    }
  }, [removeItem, findCartItem]);

  const handleBuyNow = useCallback(() => {
    if (!product?.Id) return;
    
    // First add to cart, then navigate to cart
    handleAddToCart(product.Id);
    // In a real app, you'd navigate to checkout
    toast.success('Added to cart! Navigate to checkout...');
  }, [product?.Id, handleAddToCart]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.Name || "Product",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (productLoading) {
    return <ProductPageSkeleton />;
  }

  if (productError || !product) {
    return <ProductNotFound />;
  }

  return (
    <PageLayout className="bg-white">
      {/* Mobile & Tablet Header */}
      <div className="xl:hidden">
        <ProductHeader 
          onShare={handleShare}
        />
      </div>

      {/* Main Content */}
      <div className="xl:container xl:mx-auto xl:px-6 xl:py-4">
        <div className="xl:grid xl:grid-cols-12 xl:gap-6 xl:max-w-5xl xl:mx-auto px-6 xl:px-0">
          {/* Image Gallery - Desktop: Left Column, Mobile: Full Width */}
          <div className="xl:col-span-7">
            <ProductImageGallery 
              images={product.Images || []}
              mainImage={product.MainImage || undefined}
              productName={product.Name || "Product"}
            />
          </div>

          {/* Product Info - Desktop: Right Column, Mobile: Below Gallery */}
          <div className="xl:col-span-5 px-4 xl:px-0 mt-3 xl:mt-0">
            <ProductInfo 
              product={product}
              onAddToCart={() => handleAddToCart()}
              onBuyNow={handleBuyNow}
              onShare={handleShare}
              isProductInCart={isProductInCart}
              getProductQuantity={getProductQuantity}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              isAdding={isAdding}
              isUpdating={isUpdating}
              isRemoving={isRemoving}
              userCurrency={userCurrency}
              exchangeRates={exchangeRates ?? undefined}
            />
          </div>
        </div>
      </div>
        {/* Product Details Container - Relative positioning for sticky action bar (starts after image) */}
        <div className="relative">
          {/* Product Content - Below main content */}
          <div className="mt-4 xl:mt-6">
            <ProductContent product={product} />
          </div>

          {/* Mobile Action Bar - At the end of product details, sticky within this container */}
          <div className="xl:hidden sticky bottom-3 z-50 ">
            <div className="px-6">
              <div className="bg-white border-t border-gray-200 pt-3 pb-4">
                {isProductInCart(product.Id || '') ? (
                  // Product is in cart - show quantity controls, remove, and buy now
                  <div className="space-y-2">
                    {/* Row 1: Quantity Controls and Remove */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateQuantity(product.Id || '', getProductQuantity(product.Id || '') - 1)}
                          disabled={isUpdating || getProductQuantity(product.Id || '') <= 1}
                          className="h-9 w-9 p-0 hover:bg-gray-200"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                        </Button>
                        
                        <span className="flex-1 text-center text-xs font-medium">
                          {getProductQuantity(product.Id || '')}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateQuantity(product.Id || '', getProductQuantity(product.Id || '') + 1)}
                          disabled={isUpdating || getProductQuantity(product.Id || '') >= (product.Stock || 0)}
                          className="h-9 w-9 p-0 hover:bg-gray-200"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="outline"
                        onClick={() => handleRemoveFromCart(product.Id || '')}
                        disabled={isRemoving}
                        className="h-9 text-xs font-medium"
                        size="sm"
                      >
                        {isRemoving ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Remove
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Row 2: Buy Now Button */}
                    <Button
                      onClick={handleBuyNow}
                      disabled={!product.Stock || product.Stock === 0}
                      className="w-full h-9 text-xs font-medium"
                      size="sm"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Buy Now
                    </Button>
                  </div>
                ) : (
                  // Product not in cart - show add to cart and buy now
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleBuyNow}
                      disabled={!product.Stock || product.Stock === 0}
                      variant="outline"
                      className="h-9 text-xs font-medium"
                      size="sm"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Buy Now
                    </Button>
                    
                    <Button
                      onClick={() => handleAddToCart()}
                      disabled={!product.Stock || product.Stock === 0 || isAdding}
                      className="h-9 text-xs font-medium"
                      size="sm"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Add Cart
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        {/* Recommendation Sections */}
        <div className="mt-4 xl:mt-6 space-y-6">
          <div className="xl:max-w-5xl xl:mx-auto">
            {/* Related Products Section */}
            {relatedLoading ? (
              <div className="px-4 xl:px-0">
                <div className="h-5 bg-gray-200 animate-pulse rounded w-1/3 mb-3"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2 animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : relatedProducts.length > 0 ? (
              <RecommendationSection 
                title="Related Products"
                products={relatedProducts}
                showViewAll
                userCurrency={userCurrency}
                exchangeRates={exchangeRates ?? undefined}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveFromCart={handleRemoveFromCart}
                getCartQuantity={getProductQuantity}
                isProductInCart={isProductInCart}
                isAddingToCart={isAdding}
                isUpdatingCart={isUpdating}
                isRemovingFromCart={isRemoving}
              />
            ) : null}
            
            {/* Seller Products Section */}
            {sellerLoading ? (
              <div className="px-4 xl:px-0">
                <div className="h-5 bg-gray-200 animate-pulse rounded w-1/3 mb-3"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2 animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : enrichedSellerProducts.length > 0 ? (
              <RecommendationSection 
                title={`More from ${product.SellerName || "Seller"}`}
                products={enrichedSellerProducts}
                sellerName={product.SellerName || undefined}
                userCurrency={userCurrency}
                exchangeRates={exchangeRates ?? undefined}
                showStoreButton
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveFromCart={handleRemoveFromCart}
                getCartQuantity={getProductQuantity}
                isProductInCart={isProductInCart}
                isAddingToCart={isAdding}
                isUpdatingCart={isUpdating}
                isRemovingFromCart={isRemoving}
              />
            ) : null}
          </div>
        </div>
        </div>
    </PageLayout>
  );
}