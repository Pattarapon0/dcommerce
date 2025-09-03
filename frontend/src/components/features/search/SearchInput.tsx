"use client";

import { useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AutocompleteDropdown } from "./AutocompleteDropdown";
import type { ProductDto } from "@/lib/api/products";



interface SearchInputProps {
  value: string;
  suggestions: ProductDto[];
  showDropdown: boolean;
  loading: boolean;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSuggestionSelect: (value: string) => void;
  onClear: () => void;
  className?: string;
}

export function SearchInput({ 
  value,
  suggestions,
  showDropdown,
  loading,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  onSuggestionSelect,
  onClear,
  className = "" 
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        {/* Search Icon */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {/* Input */}
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Search products..."
          aria-label="Search products"
          aria-expanded={showDropdown}
          aria-describedby={showDropdown ? "search-suggestions" : undefined}
          role="combobox"
          aria-autocomplete="list"
          className={`
            pl-10 pr-10 border-gray-200 bg-white
            transition-all duration-200 ease-in-out
            focus:ring-2 focus:ring-blue-400 focus:border-transparent
            h-10
          `}
        />

        {/* Clear Button */}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div id="search-suggestions" role="listbox" aria-label="Search suggestions">
          <AutocompleteDropdown
            suggestions={suggestions}
            loading={loading}
            onSelect={onSuggestionSelect}
          />
        </div>
      )}
    </div>
  );
}