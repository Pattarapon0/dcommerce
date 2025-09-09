"use client";

import Image from "next/image";
import { useFormatUserPrice } from "@/hooks/useUserCurrency";
import type { ProductDto } from "@/lib/api/products";


interface AutocompleteDropdownProps {
  suggestions: ProductDto[];
  loading: boolean;
  onSelect: (value: string) => void;
}

export function AutocompleteDropdown({ suggestions, loading, onSelect }: AutocompleteDropdownProps) {
  const formatPrice = useFormatUserPrice();

  const handleItemClick = (item: ProductDto) => {
    onSelect(item.Name ? item.Name : "");
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
      {loading ? (
        <div className="p-3 text-sm text-gray-500 text-center">
          Searching...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="p-3 text-sm text-gray-500 text-center">
          No products found
        </div>
      ) : (
        <div className="py-1">
          {suggestions.map((item) => (
            <button
              key={item.Id}
              onClick={() => handleItemClick(item)}
              role="option"
              aria-selected={false}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-150"
            >
              <div className="flex items-center gap-3">
                {/* Product Image */}
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.MainImage ? (
                      <Image
                        src={item.MainImage}
                        alt={`${item.Name} thumbnail`}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        quality={75}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No img</span>
                      </div>
                    )}
                  </div>
             

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {item.Name}
                    </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {formatPrice(item.Price ?? 0)}
                      </span>

                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}