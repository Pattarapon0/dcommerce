"use client";

import { Badge } from "@/components/ui/badge";
import { ProductDto } from "@/lib/api/products";

interface ProductBadgeProps {
  product: ProductDto;
  className?: string;
}

export default function ProductBadge({ product, className = "" }: ProductBadgeProps) {
  const getBadge = () => {
    const stock = product.Stock || 0;
    const salesCount = product.SalesCount || 0;
    
    // Priority order: Out of Stock > Low Stock > Best Seller > Popular > New > Deal
    
    // Out of Stock (highest priority)
    if (stock === 0) {
      return {
        text: "❌ Out of Stock",
        className: "bg-red-100 text-red-800 border-red-200",
        priority: 1
      };
    }
    
    // Low Stock (high priority)
    if (stock <= 3) {
      return {
        text: `🔥 Only ${stock} left`,
        className: "bg-orange-100 text-orange-800 border-orange-200",
        priority: 2
      };
    }
    
    // Best Seller (high sales)
    if (salesCount >= 500) {
      return {
        text: "💎 Best Seller",
        className: "bg-purple-100 text-purple-800 border-purple-200",
        priority: 3
      };
    }
    
    // Popular (moderate sales)
    if (salesCount >= 100) {
      return {
        text: "🔥 Popular",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        priority: 4
      };
    }
    
    // New (recently created - within last 30 days)
    if (product.CreatedAt) {
      const createdDate = new Date(product.CreatedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (createdDate > thirtyDaysAgo) {
        return {
          text: "⚡ New",
          className: "bg-green-100 text-green-800 border-green-200",
          priority: 5
        };
      }
    }
    
    // Deal (could be based on discount percentage - for now just a placeholder)
    // This could be enhanced to show actual discount percentage
    if (Math.random() > 0.8) { // 20% chance for demo purposes
      return {
        text: "💰 Deal",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        priority: 6
      };
    }
    
    return null;
  };

  const badge = getBadge();

  if (!badge) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${badge.className} ${className}`}
    >
      {badge.text}
    </Badge>
  );
}