"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

interface ProductsFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    category?: string;
    status?: string;
  }) => void;
  totalProducts: number;
  isLoading: boolean;
  canUseFilters?: boolean;
  loadingMessage?: string;
}

export default function ProductsFilters({
  onFiltersChange,
  totalProducts,
  isLoading,
  canUseFilters = true,
  loadingMessage,
}: ProductsFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Categories matching ProductCategory enum from backend
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Electronics", label: "Electronics" },
    { value: "Clothing", label: "Clothing" },
    { value: "Books", label: "Books" },
    { value: "Home", label: "Home & Garden" },
    { value: "Sports", label: "Sports & Outdoors" },
    { value: "Other", label: "Other" },
  ];

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (canUseFilters) {
      onFiltersChange({ search: value });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (canUseFilters) {
      onFiltersChange({ 
        category: category === "all" ? undefined : category 
      });
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    if (canUseFilters) {
      onFiltersChange({ 
        status: status === "all" ? undefined : status 
      });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    if (canUseFilters) {
      onFiltersChange({
        search: "",
        category: undefined,
        status: undefined,
      });
    }
  };

  const hasActiveFilters = search || selectedCategory !== "all" || selectedStatus !== "all";

  // Disable state styling
  const disabledClass = !canUseFilters ? "opacity-50 cursor-not-allowed" : "";
  const disabledProps = !canUseFilters ? { disabled: true } : {};

  return (
    <div className="space-y-4">
      {/* Header with Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{totalProducts.toLocaleString()} products</span>
          {hasActiveFilters && canUseFilters && (
            <>
              <span>•</span>
              <button
                onClick={clearFilters}
                className="text-primary hover:underline"
              >
                Clear filters
              </button>
            </>
          )}
          {loadingMessage && (
            <>
              <span>•</span>
              <span className="text-blue-600 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {loadingMessage}
              </span>
            </>
          )}
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/seller/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className={`relative flex-1 min-w-0 ${disabledClass}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={canUseFilters ? "Search products..." : "Loading data for search..."}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading || !canUseFilters}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {/* Category Filter */}
          <div className={disabledClass}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="justify-between min-w-[140px]"
                  {...disabledProps}
                >
                  <span className="truncate">
                    {categories.find(c => c.value === selectedCategory)?.label}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              {canUseFilters && (
                <DropdownMenuContent align="end" className="w-48">
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.value}
                      onClick={() => handleCategoryChange(category.value)}
                      className={selectedCategory === category.value ? "bg-muted" : ""}
                    >
                      {category.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>

          {/* Status Filter */}
          <div className={disabledClass}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="justify-between min-w-[120px]"
                  {...disabledProps}
                >
                  <span className="truncate">
                    {statuses.find(s => s.value === selectedStatus)?.label}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              {canUseFilters && (
                <DropdownMenuContent align="end" className="w-40">
                  {statuses.map((status) => (
                    <DropdownMenuItem
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      className={selectedStatus === status.value ? "bg-muted" : ""}
                    >
                      {status.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      {hasActiveFilters && canUseFilters && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary" className="gap-1">
               Search: &quot;{search}&quot;
              <button
                onClick={() => handleSearchChange("")}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Category: {categories.find(c => c.value === selectedCategory)?.label}
              <button
                onClick={() => handleCategoryChange("all")}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedStatus !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {statuses.find(s => s.value === selectedStatus)?.label}
              <button
                onClick={() => handleStatusChange("all")}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Disabled State Message */}
      {!canUseFilters && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Filters will be available once all product data is loaded...</span>
          </div>
        </div>
      )}
    </div>
  );
}