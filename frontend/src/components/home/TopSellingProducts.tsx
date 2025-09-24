"use client";

import { useGetTopSellingProducts } from "@/hooks/useProduct";
import { ProductGrid } from "@/components/features/search/ProductGrid";
import { useAuth } from "@/hooks/useAuth";
import { useAtomValue } from "jotai";
import { exchangeRateAtom } from "@/stores/exchageRate";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "@/lib/toast";
import Link from "next/link";

export default function TopSellingProducts() {
  const { data: products, isLoading, error } = useGetTopSellingProducts(8);
  const { userProfile } = useAuth();
  const exchangeRateQuery = useAtomValue(exchangeRateAtom);
  const router = useRouter();
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

  const userCurrency = userProfile?.PreferredCurrency || "THB";
  const exchangeRates = exchangeRateQuery.data?.Rates;

  const handleAddToCart = useCallback((productId: string, quantity: number = 1) => {
    const product = products?.find(p => p.Id === productId);
    if (!product) return;
    
    const currentQuantity = getProductQuantity(productId);
    const maxStock = product.Stock || 0;
    
    if (currentQuantity + quantity > maxStock) {
      toast.error(`Only ${maxStock} available in stock`);
      return;
    }
    
    addToCart({ ProductId: productId, Quantity: quantity });
  }, [addToCart, products, getProductQuantity]);

  const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
    const product = products?.find(p => p.Id === productId);
    const cartItem = findCartItem(productId);
    
    if (!product || !cartItem) return;
    
    const maxStock = product.Stock || 0;
    
    if (newQuantity < 1) {
      toast.error('Minimum quantity is 1');
      return;
    }
    
    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} available in stock`);
      return;
    }
    
    updateQuantity(cartItem.Id!, newQuantity);
  }, [updateQuantity, products, findCartItem]);

  const handleRemoveFromCart = useCallback((productId: string) => {
    const cartItem = findCartItem(productId);
    if (cartItem) {
      removeItem(cartItem.Id || '');
    }
  }, [removeItem, findCartItem]);

  const handleQuickView = useCallback((productId: string) => {
    router.push(`/product/${productId}`);
  }, [router]);

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Best Sellers
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Most popular products loved by our customers
            </p>
          </div>
          <Link 
            href="/search?sortBy=SalesCount&ascending=false" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </Link>
        </div>

        <ProductGrid 
          products={products || []} 
          loading={isLoading}
          error={error?.message}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveFromCart={handleRemoveFromCart}
          onQuickView={handleQuickView}
          userCurrency={userCurrency}
          exchangeRates={exchangeRates ?? undefined}
          getCartQuantity={getProductQuantity}
          isProductInCart={isProductInCart}
          isAddingToCart={isAdding}
          isUpdatingCart={isUpdating}
          isRemovingFromCart={isRemoving}
        />
      </div>
    </section>
  );
}