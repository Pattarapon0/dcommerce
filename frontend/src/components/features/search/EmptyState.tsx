"use client";

import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Package } from "lucide-react";

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
  //suggestions = [],
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

  //const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

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
