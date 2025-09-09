"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ProductSearchRequest } from "@/lib/api/products";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrencyCompact, convertCurrency } from "@/lib/utils/currency";
import { useAtomValue } from "jotai";
import { exchangeRateAtom } from "@/stores/exchageRate";

interface FilterPanelProps {
  filters?: ProductSearchRequest;
  onFiltersChange: (filters: ProductSearchRequest) => void;
  className?: string;
}

// Base price presets in THB (the base currency)
const BASE_PRICE_PRESETS = [
  { min: 0, max: 1000 },      // 0-1,000 THB
  { min: 1000, max: 2500 },   // 1,000-2,500 THB  
  { min: 2500, max: 5000 },   // 2,500-5,000 THB
  { min: 5000, max: 50000 },  // 5,000+ THB
];

const CATEGORIES = [
  { id: "Electronics", name: "Electronics" },
  { id: "Clothing", name: "Clothing" },
  { id: "Home", name: "Home & Garden" },
  { id: "Books", name: "Books" },
  { id: "Sports", name: "Sports & Outdoors" },
  { id: "Other", name: "Other" },
];

export function FilterPanel({ filters, onFiltersChange, className = "" }: FilterPanelProps) {
  // Provide safe defaults for filters
  const safeFilters = filters || {};
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const { userProfile } = useAuth();
  const exchangeRateQuery = useAtomValue(exchangeRateAtom);
  
  // Get user's preferred currency, default to THB (base currency)
  const userCurrency = userProfile?.PreferredCurrency || "THB";
  
  // Generate dynamic price presets based on user's currency and exchange rates
  const PRICE_PRESETS = useMemo(() => {
    if (!exchangeRateQuery.data?.Rates) {
      // Fallback to basic presets if exchange rates not loaded
      return BASE_PRICE_PRESETS.map(preset => ({
        label: `${formatCurrencyCompact(preset.min, userCurrency)} - ${
          preset.max >= 50000 ? `${formatCurrencyCompact(preset.min, userCurrency)}+` : formatCurrencyCompact(preset.max, userCurrency)
        }`,
        min: preset.min,
        max: preset.max,
      }));
    }

    const exchangeRates = exchangeRateQuery.data.Rates;
    
    return BASE_PRICE_PRESETS.map(preset => {
      // Convert THB base prices to user's preferred currency
      const convertedMin = Math.round(convertCurrency(preset.min, 'THB', userCurrency, exchangeRates));
      const convertedMax = Math.round(convertCurrency(preset.max, 'THB', userCurrency, exchangeRates));
      
      return {
        label: `${formatCurrencyCompact(convertedMin, userCurrency)} - ${
          preset.max >= 50000 ? `${formatCurrencyCompact(convertedMin, userCurrency)}+` : formatCurrencyCompact(convertedMax, userCurrency)
        }`,
        min: convertedMin,
        max: convertedMax,
      };
    });
  }, [userCurrency, exchangeRateQuery.data?.Rates]);
  
  const updateFilters = (updates: Partial<ProductSearchRequest>) => {
    onFiltersChange({ ...safeFilters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      ...safeFilters,
      MinPrice: undefined,
      MaxPrice: undefined,
      Category: undefined,
      InStockOnly: false,
    });
  };

  const hasActiveFilters = 
    (safeFilters.MinPrice != null) || 
    (safeFilters.MaxPrice != null && safeFilters.MaxPrice < 50000) || 
    (safeFilters.Category != null) || 
    (safeFilters.InStockOnly === true);

  const activeFilterCount = [
    (safeFilters.MinPrice != null) || (safeFilters.MaxPrice != null && safeFilters.MaxPrice < 50000),
    safeFilters.Category != null,
    safeFilters.InStockOnly === true,
  ].filter(Boolean).length;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 space-y-4 ${className}`} role="region" aria-labelledby="filter-heading">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 id="filter-heading" className="font-medium text-gray-900">
          Filters {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs" aria-label={`${activeFilterCount} active filters`}>
              {activeFilterCount}
            </Badge>
          )}
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-gray-700"
            aria-label="Clear all active filters"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">Active Filters</Label>
          <div className="flex flex-wrap gap-2">
            {((safeFilters.MinPrice != null) || (safeFilters.MaxPrice != null && safeFilters.MaxPrice < 50000)) && (
              <Badge variant="outline" className="text-xs flex items-center gap-1 max-w-full">
                <span className="truncate max-w-[200px] sm:max-w-[160px]">
                  {formatCurrencyCompact(safeFilters.MinPrice || 0, userCurrency)} - {
                    safeFilters.MaxPrice && safeFilters.MaxPrice < 50000 
                      ? formatCurrencyCompact(safeFilters.MaxPrice, userCurrency)
                      : `${formatCurrencyCompact(safeFilters.MinPrice || 100, userCurrency)}+`
                  }
                </span>
                <button
                  onClick={() => updateFilters({ MinPrice: undefined, MaxPrice: undefined })}
                  className="hover:bg-gray-100 rounded-full p-0.5 flex-shrink-0"
                  aria-label="Remove price range filter"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
            {safeFilters.Category && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                {CATEGORIES.find(c => c.id === safeFilters.Category)?.name || safeFilters.Category}
                <button
                  onClick={() => updateFilters({ Category: undefined })}
                  className="hover:bg-gray-100 rounded-full p-0.5"
                  aria-label={`Remove ${CATEGORIES.find(c => c.id === safeFilters.Category)?.name || safeFilters.Category} category filter`}
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
            {safeFilters.InStockOnly && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                In Stock Only
                <button
                  onClick={() => updateFilters({ InStockOnly: false })}
                  className="hover:bg-gray-100 rounded-full p-0.5"
                  aria-label="Remove in stock only filter"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Price Range</Label>
        {exchangeRateQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-11 sm:h-8 bg-gray-100 animate-pulse rounded"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRICE_PRESETS.map((preset, index) => (
               <Button
                key={`${preset.label}-${index}`}
                 variant={
                   (safeFilters.MinPrice === preset.min && safeFilters.MaxPrice === preset.max)
                     ? "default"
                     : "outline"
                 }
                size="sm"
                onClick={() => updateFilters({ MinPrice: preset.min, MaxPrice: preset.max })}
                className="text-xs h-auto min-h-[44px] sm:min-h-[36px] py-2 px-3 whitespace-normal text-center leading-tight"
                title={preset.label}
                aria-label={`Filter by price range: ${preset.label}`}
                 aria-pressed={safeFilters.MinPrice === preset.min && safeFilters.MaxPrice === preset.max}
              >
                <span className="block w-full truncate">
                  {preset.label}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <button
          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
          className="flex items-center justify-between w-full text-left"
          aria-expanded={categoriesExpanded}
          aria-label={`${categoriesExpanded ? 'Collapse' : 'Expand'} categories section`}
        >
          <Label className="text-sm font-medium text-gray-900 cursor-pointer">
            Categories
          </Label>
          {categoriesExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" aria-hidden="true" />
          )}
        </button>

        {categoriesExpanded && (
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                 <Checkbox
                   id={category.id}
                   checked={safeFilters.Category === category.id}
                   onCheckedChange={(checked) => {
                     updateFilters({ 
                       Category: checked ? category.id as NonNullable<ProductSearchRequest>['Category'] : undefined
                     });
                   }}
                 />
                <Label
                  htmlFor={category.id}
                  className="text-sm text-gray-700 cursor-pointer flex-1"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Availability */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Availability</Label>
        <div className="flex items-center space-x-2">
           <Switch
             id="in-stock"
             checked={safeFilters.InStockOnly || false}
             onCheckedChange={(checked) => updateFilters({ InStockOnly: checked })}
           />
          <Label htmlFor="in-stock" className="text-sm text-gray-700 cursor-pointer">
            In Stock Only
          </Label>
        </div>
      </div>
    </div>
  );
}