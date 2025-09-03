"use client";

import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Cart Icon */}
      <div className="text-6xl mb-4">🛒</div>
      
      {/* Primary Message */}
      <h2 className="text-xl font-medium text-gray-900 mb-2">
        Your cart is empty
      </h2>
      
      {/* Secondary Message */}
      <p className="text-gray-600 mb-6">
        Start adding some products!
      </p>
      
      {/* CTA Button */}
      <Link 
        href="/search"
        className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Browse Products
      </Link>
    </div>
  );
}