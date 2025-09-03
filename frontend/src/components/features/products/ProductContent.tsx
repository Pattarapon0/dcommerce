"use client";

import { ProductDto } from "@/lib/api/products";

interface ProductContentProps {
  product: ProductDto;
}

export default function ProductContent({ product }: ProductContentProps) {
  const productSpecs = {
    "Category": product.Category || "Not specified",
    "Stock": `${product.Stock || 0} units available`
  };

  return (
    <div className="lg:max-w-4xl lg:mx-auto">
      {/* Mobile Layout - Simplified to match desktop */}
      <div className="lg:hidden px-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-3">Product Description</h3>
            <p className="text-gray-700 leading-relaxed text-sm">
              {product.Description || "No description available"}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">Product Details</h3>
            <div className="space-y-2">
              {Object.entries(productSpecs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">{key}:</span>
                  <span className="font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Tab System */}
      <div className="hidden lg:block">
        {/* This could be enhanced with a proper tab system in the future */}
        <div className="grid grid-cols-1 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Product Description</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                {product.Description || "No description available"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Product Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(productSpecs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}