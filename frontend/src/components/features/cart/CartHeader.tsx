"use client";

import Link from "next/link";

interface CartHeaderProps {
  itemCount?: number;
}

export default function CartHeader({ itemCount = 3 }: CartHeaderProps) {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🛒</span>
        <h1 className="text-xl font-semibold">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
      </div>
      
      <Link 
        href="/search" 
        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
      >
        Continue Shopping <span>→</span>
      </Link>
    </header>
  );
}