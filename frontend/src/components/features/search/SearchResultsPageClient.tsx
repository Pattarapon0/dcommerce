"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useMemo, useCallback, useEffect } from "react";
import { ProductGrid } from "./ProductGrid";
import { FilterPanel } from "./FilterPanel";
import { SearchHeader } from "./SearchHeader";
import { MobileFilterButton } from "./MobileFilterSheet";
import { PageLayout } from "@/components/layout/PageLayout";
import { useGetProductsSearchResult } from "@/hooks/useProduct";
import { useAuth } from "@/hooks/useAuth";
import { useAtomValue } from "jotai";
import { exchangeRateAtom } from "@/stores/exchageRate";
import {type ProductSearchRequest} from '@/lib/api/products';
import { toast } from "@/lib/toast";
import { useCart } from "@/hooks/useCart";

export function SearchResultsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get("q") || "";
  const { userProfile } = useAuth();
  const exchangeRateQuery = useAtomValue(exchangeRateAtom);
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
  const [sortBy, setSortBy] = useState("relevance");
  // Initialize filters from URL params
  const getFiltersFromURL = useCallback((): ProductSearchRequest => {
    return {
      Page: parseInt(searchParams.get("page") || "1"),
      PageSize: parseInt(searchParams.get("pageSize") || "20"),
      Category: (searchParams.get("category") || undefined) as "Electronics" | "Clothing" | "Books" | "Home" | "Sports" | "Other" | undefined,
      MinPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
      MaxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
      SearchTerm: query,
      SortBy: searchParams.get("sortBy") || "SalesCount",
      Ascending: searchParams.get("ascending") === "true",
      InStockOnly: searchParams.get("inStockOnly") === "true",
    };
  }, [searchParams, query]);

  const [filters, setFilters] = useState<ProductSearchRequest>(getFiltersFromURL);

  // Update filters when URL params change (e.g., browser back/forward)
  useEffect(() => {
    setFilters(getFiltersFromURL());
  }, [getFiltersFromURL]);

  // Update URL when filters change
  const updateURL = useCallback((newFilters: ProductSearchRequest) => {
    const params = new URLSearchParams(searchParams.toString());
    // Set or remove parameters
    if (newFilters && newFilters.Category) params.set("category", newFilters.Category);
    else params.delete("category");

    if (newFilters && newFilters.MinPrice !== undefined) params.set("minPrice", newFilters.MinPrice.toString());
    else params.delete("minPrice");

    if (newFilters && newFilters.MaxPrice !== undefined) params.set("maxPrice", newFilters.MaxPrice.toString());
    else params.delete("maxPrice");

    if (newFilters && newFilters.SortBy && newFilters.SortBy !== "SalesCount") params.set("sortBy", newFilters.SortBy);
    else params.delete("sortBy");

    if (newFilters && newFilters.Ascending) params.set("ascending", "true");
    else params.delete("ascending");

    if (newFilters && newFilters.InStockOnly) params.set("inStockOnly", "true");
    else params.delete("inStockOnly");

    if (newFilters && newFilters.Page && newFilters.Page > 1) params.set("page", newFilters.Page.toString());
    else params.delete("page");

    if (newFilters && newFilters.PageSize && newFilters.PageSize !== 20) params.set("pageSize", newFilters.PageSize.toString());
    else params.delete("pageSize");

    // Keep the search query
    if (query) params.set("q", query);
    
    // Update URL without triggering navigation
    const newURL = `${pathname}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  }, [searchParams, pathname, router, query]);

  // Get user's preferred currency, default to THB (base currency)
  const userCurrency = userProfile?.PreferredCurrency || "THB";
  const exchangeRates = exchangeRateQuery.data?.Rates;

  // Memoize filters to prevent unnecessary re-renders and API calls
  const memoizedFilters = useMemo(() => filters, [filters]);

  // Stable callback reference to prevent child re-renders
  const handleFiltersChange = useCallback((newFilters: ProductSearchRequest) => {
    const updatedFilters = { ...filters, ...newFilters, Page: 1 }; // Reset to page 1 when filters change
    setFilters(updatedFilters);
    updateURL(updatedFilters);
  }, [filters, updateURL]);

  // Handle sort change from SearchHeader
  const handleSortChange = useCallback((sortBy: string, ascending: boolean,text:string) => {
    const updatedFilters = { ...filters, SortBy: sortBy, Ascending: ascending, Page: 1 };
    setSortBy(text);
    setFilters(updatedFilters);
    updateURL(updatedFilters);
  }, [filters, updateURL]);

  const { data, isLoading, error } = useGetProductsSearchResult(memoizedFilters);

  // Flatten infinite query pages into single products array
  const products = useMemo(() => {
    return data?.pages?.flatMap(page => page.Items || []) || [];
  }, [data?.pages]);

  const totalCount = data?.pages?.[0]?.TotalCount || 0;

  const handleAddToCart = useCallback((productId: string, quantity: number = 1) => {
    const product = products.find(p => p.Id === productId);
    if (!product) return;
    
    const currentQuantity = getProductQuantity(productId);
    const maxStock = product.Stock || 0;
    
    // Validate stock availability
    if (currentQuantity + quantity > maxStock) {
      toast.error(`Only ${maxStock} available in stock`);
      return;
    }
    
    addToCart({ ProductId: productId, Quantity: quantity });
  }, [addToCart, products, getProductQuantity]);

  const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
    const product = products.find(p => p.Id === productId);
    const cartItem = findCartItem(productId);
    
    if (!product || !cartItem) {
      return;
    }
    
    const maxStock = product.Stock || 0;
    
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

  return (
    <PageLayout className="bg-gray-50" fullHeight>
      {/* Search Results Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stable header with reserved space for dropdown */}
        <div className="mb-6">
          <SearchHeader 
            query={query} 
            resultCount={totalCount}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            filters={memoizedFilters}
            userCurrency={userCurrency}
          />
        </div>
        
        <div className="flex gap-6">
          {/* Filter Panel - Desktop Only (proper breakpoints) */}
          <div className="hidden xl:block w-[200px] 2xl:w-[240px] flex-shrink-0">
            <FilterPanel filters={memoizedFilters} onFiltersChange={handleFiltersChange} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">     
            <ProductGrid 
              products={products} 
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
        </div>

        {/* Mobile/Medium Screen Filter Button - Shows when sidebar is hidden */}
        <div className="xl:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <MobileFilterButton filters={memoizedFilters} onFiltersChange={handleFiltersChange} />
        </div>
      </div>
    </PageLayout>
  );
}