"use client";

import Link from 'next/link';
import AuthSection from './AuthSection';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '../features/search/SearchInput';
import { useGetProductsSearchResult } from '@/hooks/useProduct';
import { useCartStatus } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';



export default function Navbar() {
  const { itemCount: cartItemCount } = useCartStatus();
  const { userProfile } = useAuth();

  // Check if user is a seller
  const isSeller = userProfile?.Role === 'Seller';

  // Search state
  const [searchValue, setSearchValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  // Search suggestions logic
  const shouldSearch = searchValue.trim().length >= 1;
  const { data: searchResults, isLoading: searchLoading } = useGetProductsSearchResult(
    { 
      SearchTerm: searchValue.trim(), 
      PageSize: 5, 
      Page: 1,
      SortBy: "SalesCount",
      Ascending: false
    },
    shouldSearch
  );

  // Extract products from paginated response
  const searchSuggestions = searchResults?.pages?.[0]?.Items || [];

  const handleSearchSubmit = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (newValue: string) => {
    setSearchValue(newValue);
    setShowDropdown(true);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setShowDropdown(false);
      handleSearchSubmit(searchValue);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSuggestionSelect = (selectedValue: string) => {
    setSearchValue(selectedValue);
    setShowDropdown(false);
    handleSearchSubmit(selectedValue);
  };

  const handleSearchFocus = () => {
    if (searchValue.trim().length >= 1) {
      setShowDropdown(true);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  const clearSearch = () => {
    setSearchValue("");
    setShowDropdown(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 gap-4">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary" onClick={() => setShowDropdown(false)}>
              Marketplace
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8 flex items-center">
            <SearchInput 
              value={searchValue}
              suggestions={searchSuggestions}
              showDropdown={showDropdown}
              loading={searchLoading}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onSuggestionSelect={handleSuggestionSelect}
              onClear={clearSearch}
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Become a Seller Button / Seller Dashboard */}
            {isSeller ? (
              <Link href="/seller/dashboard">
                <Button variant="outline" size="sm" className="hidden lg:flex">
                  Seller Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/become-seller">
                <Button variant="outline" size="sm" className="hidden lg:flex">
                  Become a Seller
                </Button>
              </Link>
            )}

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

            {/* Auth Section (includes Profile dropdown) */}
            <AuthSection />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden pb-3">
          <SearchInput 
            value={searchValue}
            suggestions={searchSuggestions}
            showDropdown={showDropdown}
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