"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CommandSearchBar } from '../ui/CommandSearchBar';
import { mockCategories } from '@/lib/data/mockCategories';
// Dynamic import for client-only auth section to prevent hydration mismatch
const AuthSection = dynamic(() => import('./AuthSection'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm">Login</Button>
      <Button size="sm">Sign Up</Button>
    </div>
  )
});

export default function Navbar() {
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const cartItemCount = 3; // TODO: Replace with actual cart state
  
  // Fix hydration mismatch for dropdown only
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 gap-4 ">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              Marketplace
            </Link>
          </div>
            {/* Categories Dropdown */}
            <div
            className="relative lg:block flex items-center pt-3"
            onMouseEnter={() => isClient && setShowCategoriesDropdown(true)}
            onMouseLeave={() => isClient && setShowCategoriesDropdown(false)}
            >
            <Button
              variant="outline"
              className="text-sm w-32"
              tabIndex={0}
            >
              <span className='text-left'>Categories</span>
              <span className="ml-1">▼</span>
            </Button>
            
            {isClient && showCategoriesDropdown && (
              <div 
              className="absolute top-12 left-0 w-56 bg-white border border-border border-t-0 rounded-b-md shadow-lg z-[60]"
              >
              <div >
                {mockCategories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
                >
                  <div className="flex justify-between items-center">
                  <span>{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {category.productCount}
                  </span>
                  </div>
                </Link>
                ))}
                <div className="border-t border-border mt-2 pt-2">
                <Link
                  href="/categories"
                  className="block px-4 py-2 text-sm text-primary font-medium hover:bg-gray-100"
                >
                  View All Categories →
                </Link>
                </div>
              </div>
              </div>
            )}
            </div>

          {/* Search Bar */}
          <div className="content-center w-[30%] max-w-2xl flex items-start pt-3">
            <CommandSearchBar />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex md:space-x-6 items-center">
            <Link 
              href="/shop" 
              className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
            >
              Shop
            </Link>
            <Link 
              href="/sellers" 
              className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
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
            <Link href="/cart" className="relative">
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
          <CommandSearchBar />
        </div>
      </div>
    </nav>
  );
}