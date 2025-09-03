"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { mockCategories } from '@/lib/data/mockCategories';

export default function CategoriesDropdown() {
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);

  return (
    <div
      className="relative lg:block flex items-center pt-3"
      onMouseEnter={() => setShowCategoriesDropdown(true)}
      onMouseLeave={() => setShowCategoriesDropdown(false)}
    >
      <Button
        variant="outline"
        className="text-sm w-32"
        tabIndex={0}
      >
        <span className='text-left'>Categories</span>
        <span className="ml-1">▼</span>
      </Button>
      
      {showCategoriesDropdown && (
        <div 
          className="absolute top-12 left-0 w-56 bg-white border border-border border-t-0 rounded-b-md shadow-lg z-[60]"
        >
          <div>
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
  );
}