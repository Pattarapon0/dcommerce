"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FilterPanel } from "./FilterPanel";
import { Filter, X } from "lucide-react";
import { ProductSearchRequest } from "@/lib/api/products";

interface MobileFilterSheetProps {
  filters?: ProductSearchRequest;
  onFiltersChange: (filters: ProductSearchRequest) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilterSheet({
  filters,
  onFiltersChange,
  isOpen,
  onClose
}: MobileFilterSheetProps) {
  // Provide safe defaults for filters
  const safeFilters = filters || {};
  const [localFilters, setLocalFilters] = useState(safeFilters);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus management when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Focus the first focusable element when modal opens
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
      
      // Trap focus within modal
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          const focusableElements = dialogRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements?.[0] as HTMLElement;
          const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;
          
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
        
        // Close on Escape
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      ...safeFilters,
      MinPrice: undefined,
      MaxPrice: undefined,
      Category: undefined,
      InStockOnly: false,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount = [
    (localFilters?.MinPrice != null) || (localFilters?.MaxPrice != null && localFilters.MaxPrice < 50000),
    localFilters?.Category != null,
    localFilters?.InStockOnly === true,
  ].filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        ref={dialogRef}
        className="sm:max-w-full max-w-full h-[75vh] max-h-[75vh] fixed bottom-0 left-0 right-0 top-auto translate-y-0 rounded-t-xl rounded-b-none border-t border-l-0 border-r-0 border-b-0 overflow-hidden flex flex-col p-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-2 bg-gray-50">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Header */}
        <DialogHeader className="p-4 pb-2 flex-shrink-0 bg-white border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full" aria-label={`${activeFilterCount} active filters`}>
                  {activeFilterCount}
                </span>
              )}
            </DialogTitle>
            <Button
              ref={firstFocusableRef}
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Filter Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 bg-gray-50">
          <FilterPanel
            filters={localFilters}
            onFiltersChange={(filters) => setLocalFilters(filters || {})}
            className="border-0 p-0 bg-transparent"
          />
        </div>

        {/* Footer Actions - Sticky */}
        <div className="p-4 border-t bg-white flex-shrink-0 shadow-lg">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1 min-h-[48px]"
              aria-label="Clear all filters"
            >
              Clear All
            </Button>
            <Button
              ref={lastFocusableRef}
              onClick={handleApplyFilters}
              className="flex-1 min-h-[48px]"
              aria-label={`Apply ${activeFilterCount} filters`}
            >
              Apply Filters
              {activeFilterCount > 0 && (
                <span className="ml-1">({activeFilterCount})</span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface MobileFilterButtonProps {
  filters?: ProductSearchRequest;
  onFiltersChange: (filters: ProductSearchRequest) => void;
}

export function MobileFilterButton({ filters, onFiltersChange }: MobileFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Provide safe defaults for filters
  const safeFilters = filters || {};

  const activeFilterCount = [
    (safeFilters.MinPrice != null) || (safeFilters.MaxPrice != null && safeFilters.MaxPrice < 50000),
    safeFilters.Category != null,
    safeFilters.InStockOnly === true,
  ].filter(Boolean).length;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="xl:hidden flex items-center gap-2 min-h-[44px]"
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <MobileFilterSheet
        filters={filters}
        onFiltersChange={onFiltersChange}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}