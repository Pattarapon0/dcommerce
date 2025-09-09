"use client";

import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductSearchRequest } from "@/lib/api/products";

interface SearchHeaderProps {
  query: string;
  resultCount: number;
  sortBy?: string;
  onSortChange?: (sort: string, ascending: boolean,text: string) => void;
  filters?: ProductSearchRequest;
  userCurrency?: string;
}

const CATEGORIES = [
  { id: "Electronics", name: "Electronics" },
  { id: "Clothing", name: "Clothing" },
  { id: "Home", name: "Home & Garden" },
  { id: "Books", name: "Books" },
  { id: "Sports", name: "Sports & Outdoors" },
  { id: "Other", name: "Other" },
];

export function SearchHeader({ 
  query, 
  resultCount, 
  sortBy ,
  onSortChange,
  filters,
  userCurrency = "THB"
}: SearchHeaderProps) {
  
  // Generate filter summary using useMemo for performance
  const filterSummary = useMemo(() => {
    if (!filters) return "";
    
    const parts = [];
    
    // Add category filter
    if (filters.Category) {
      const categoryName = CATEGORIES.find(c => c.id === filters.Category)?.name || filters.Category;
      parts.push(categoryName);
    }
    
    // Add price range filter
    if (filters.MinPrice || filters.MaxPrice) {
      const currency = userCurrency;
      if (filters.MinPrice && filters.MaxPrice) {
        parts.push(`${currency} ${filters.MinPrice.toLocaleString()}-${filters.MaxPrice.toLocaleString()}`);
      } else if (filters.MinPrice) {
        parts.push(`${currency} ${filters.MinPrice.toLocaleString()}+`);
      } else if (filters.MaxPrice) {
        parts.push(`Under ${currency} ${filters.MaxPrice.toLocaleString()}`);
      }
    }
    
    // Add stock filter
    if (filters.InStockOnly) {
      parts.push("In stock");
    }
    
    return parts.length > 0 ? ` • ${parts.join(" • ")}` : "";
  }, [filters, userCurrency]);
  return (
    <div className="flex items-start justify-between gap-4 md:items-center">
      {/* Breadcrumb and Results Info */}
      <div className="flex-1 min-w-0">
        <nav className="text-sm text-gray-500 mb-1">
          Search {query && `• ${query}`}
        </nav>
        <h1 className="text-lg font-medium text-gray-900" aria-live="polite" aria-atomic="true">
          <span className="sr-only">Search results: </span>
          Showing {resultCount.toLocaleString()} product{resultCount !== 1 ? 's' : ''}
          {query && <span className="sr-only"> for &ldquo;{query}&rdquo;</span>}
          <span className="text-sm text-gray-600 font-normal">{filterSummary}</span>
        </h1>
      </div>

      {/* Sort Dropdown - Stable positioning */}
      <div className="flex-shrink-0 self-start md:self-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:block whitespace-nowrap">Sort by:</span>
          <div className="relative select-no-shift">
            <Select value={sortBy} onValueChange={(value) => {
              // Map frontend sort values to backend entity properties
              const sortMapping = {
                'relevance': { field: 'SalesCount', ascending: false },
                'price-low': { field: 'Price', ascending: true },
                'price-high': { field: 'Price', ascending: false },
                'newest': { field: 'CreatedAt', ascending: false },
                'most-sold': { field: 'SalesCount', ascending: false }
              };
              const mapping = sortMapping[value as keyof typeof sortMapping] || sortMapping['relevance'];
              onSortChange?.(mapping.field, mapping.ascending,value);
            }}>
              <SelectTrigger className="w-36 sm:w-40 h-9" aria-label="Sort products by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent 
                position="popper" 
                side="bottom" 
                align="end"
                sideOffset={4}
                avoidCollisions={true}
                className="w-[var(--radix-select-trigger-width)] z-50"
              >
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="most-sold">Most Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}