"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '../features/search/SearchInput';
import {useGetProductsSearch} from '@/hooks/useProduct';
import type { ProductDto} from '@/lib/api/products';
import { useCartStatus } from '@/hooks/useCart';



// Dynamic imports for client-only components to prevent hydration mismatch
const AuthSection = dynamic(() => import('./AuthSection'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm">Login</Button>
      <Button size="sm">Sign Up</Button>
    </div>
  )
});

const CategoriesDropdown = dynamic(() => import('./CategoriesDropdown'), {
  ssr: false,
  loading: () => (
    <Button variant="outline" className="text-sm w-32">
      <span className='text-left'>Categories</span>
      <span className="ml-1">▼</span>
    </Button>
  )
});

export default function Navbar() {
  const {itemCount:cartItemCount} = useCartStatus();

  // Search state - moved from SearchInput
  const [searchValue, setSearchValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  // Search suggestions logic - call hook directly
  const shouldSearch = searchValue.trim().length > 2;
  const { data: searchSuggestions = [], isLoading: searchLoading } = useGetProductsSearch(
    { Term: searchValue.trim(), Limit: 5 },
    shouldSearch
  );

  // Search suggestions logic - moved from AutocompleteDropdown


  const handleSearchSubmit = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setShowDropdown(false); // Hide dropdown on submit
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (newValue: string) => {
    setSearchValue(newValue);
    setShowDropdown(true); // Show dropdown when typing
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setShowDropdown(false); // Hide dropdown on submit
      handleSearchSubmit(searchValue);
    } else if (e.key === "Escape") {
      setShowDropdown(false); // Hide dropdown on escape
    }
  };

  const handleSuggestionSelect = (selectedValue: string) => {
    setSearchValue(selectedValue);
    setShowDropdown(false); // Hide dropdown when suggestion selected
    handleSearchSubmit(selectedValue);
  };

  const handleSearchFocus = () => {
    if (searchValue.trim().length > 2) {
      setShowDropdown(true); // Show dropdown on focus if has text
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowDropdown(false), 200); // Hide dropdown with delay for clicks
  };

  const clearSearch = () => {
    setSearchValue("");
    setShowDropdown(false); // Hide dropdown when cleared
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 gap-4 ">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary" onClick={() => setShowDropdown(false)}>
              Marketplace
            </Link>
          </div>
            {/* Categories Dropdown */}
            <CategoriesDropdown />

          {/* Search Bar */}
          <div className="content-center w-[30%] max-w-2xl flex items-start pt-3">
            <SearchInput 
              value={searchValue}
              suggestions={searchSuggestions}
              showDropdown={showDropdown && searchSuggestions.length > 0}
              loading={searchLoading}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onSuggestionSelect={handleSuggestionSelect}
              onClear={clearSearch}
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex md:space-x-6 items-center">
            <Link 
              href="/shop" 
              className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              Shop
            </Link>
            <Link 
              href="/sellers" 
              className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              Sellers
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Become a Seller Button */}
            <Button variant="outline" size="sm" className="hidden lg:flex">
              Become a Seller
            </Button>

            {/* Cart Icon */}
            <Link href="/cart" className="relative" onClick={() => setShowDropdown(false)}>
              <Button variant="ghost" size="sm" className="relative">
                🛒
                {cartItemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 text-xs flex items-center justify-center p-0"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Auth Section */}
            <AuthSection />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden pb-3">
          <SearchInput 
            value={searchValue}
            suggestions={searchSuggestions}
            showDropdown={showDropdown && searchSuggestions.length > 0}
            loading={searchLoading}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onSuggestionSelect={handleSuggestionSelect}
            onClear={clearSearch}
          />
        </div>
      </div>
    </nav>
  );
}