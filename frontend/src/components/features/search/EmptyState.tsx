"use client";

import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Package, TrendingUp } from "lucide-react";

interface EmptyStateProps {
  type: "no-results" | "error" | "network";
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export function EmptyState({
  type,
  title,
  description,
  actionText,
  onAction,
  suggestions = [],
  onSuggestionClick
}: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case "no-results":
        return <Search className="h-12 w-12 text-gray-400" />;
      case "error":
        return <AlertCircle className="h-12 w-12 text-red-400" />;
      case "network":
        return <Package className="h-12 w-12 text-gray-400" />;
      default:
        return <Search className="h-12 w-12 text-gray-400" />;
    }
  };

  const defaultSuggestions = [
    "wooden",
    "handmade", 
    "leather",
    "ceramic",
    "cotton"
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className="text-center py-12 px-4" role="main" aria-live="polite">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-4" aria-hidden="true">
          {getIcon()}
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-500 mb-6">
          {description}
        </p>

        {/* Action Button */}
        {actionText && onAction && (
          <Button 
            onClick={onAction} 
            className="mb-6"
            aria-label={`${actionText} - ${description}`}
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}

interface PopularProductCardProps {
  name: string;
  price: string;
  image: string;
}

function PopularProductCard({ name, price, image }: PopularProductCardProps) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer focus:ring-2 focus:ring-blue-400 focus:ring-offset-2" 
      role="listitem"
      tabIndex={0}
      aria-label={`Popular product: ${name}, ${price}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Handle product click
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0" aria-hidden="true">
          <div className="w-full h-full bg-gray-200" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">
            {name}
          </h4>
          <p className="text-sm text-gray-600">
            {price}
          </p>
        </div>
      </div>
    </div>
  );
}