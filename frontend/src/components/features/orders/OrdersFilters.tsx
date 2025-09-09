"use client";

import { useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrdersFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    status?: string;
    dateRange?: { from: string; to: string };
  }) => void;
  totalOrders: number;
  isLoading: boolean;
  canUseFilters?: boolean;
}

export default function OrdersFilters(props: OrdersFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Date preset options
  const datePresets = [
    { value: 'all', label: 'All Time' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3months', label: 'Last 3 Months' },
  ];

  // Date range mapper function
  const getDateRange = (preset: string): { from: string; to: string } | undefined => {
    if (preset === 'all') return undefined;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (preset) {
      case 'last7days':
        return {
          from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
        };
      case 'last30days':
        return {
          from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
        };
      case 'thisMonth':
        return {
          from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()
        };
      case 'lastMonth':
        return {
          from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
          to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString()
        };
      case 'last3months':
        return {
          from: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
        };
      default:
        return undefined;
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    props.onFiltersChange({
      search: value,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      dateRange: getDateRange(selectedDateRange)
    });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    props.onFiltersChange({
      search: searchTerm || undefined,
      status: status === 'all' ? undefined : status,
      dateRange: getDateRange(selectedDateRange)
    });
  };

  const handleDateRangeChange = (datePreset: string) => {
    setSelectedDateRange(datePreset);
    props.onFiltersChange({
      search: searchTerm || undefined,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      dateRange: getDateRange(datePreset)
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedDateRange('all');
    props.onFiltersChange({
      search: undefined,
      status: undefined,
      dateRange: undefined
    });
  };

  const hasActiveFilters = searchTerm || selectedStatus !== 'all' || selectedDateRange !== 'all';

  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing <span className="font-medium">{props.totalOrders}</span> orders</span>
            {hasActiveFilters && props.canUseFilters && (
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
          </div>
        </div>

        {/* Simplified filter block - search + status + date in one row */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex-1 flex gap-3 min-w-0">
            {/* Search input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                disabled={!props.canUseFilters}
              />
            </div>

            {/* Status and Date filters */}
            <div className="hidden md:flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="w-32 h-10 px-3 py-2 border border-input rounded-md text-sm bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 flex items-center justify-between"
                  disabled={!props.canUseFilters}
                >
                  <span>{selectedStatus === 'all' ? 'All Status' : selectedStatus}</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleStatusChange('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Processing')}>
                    Processing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Shipped')}>
                    Shipped
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Delivered')}>
                    Delivered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Cancelled')}>
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="w-32 h-10 px-3 py-2 border border-input rounded-md text-sm bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 flex items-center justify-between"
                  disabled={!props.canUseFilters}
                >
                  <span>{datePresets.find(d => d.value === selectedDateRange)?.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {datePresets.map((preset) => (
                    <DropdownMenuItem 
                      key={preset.value}
                      onClick={() => handleDateRangeChange(preset.value)}
                    >
                      {preset.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile filter drawer trigger */}
            <div className="md:hidden">
              <button 
                className="p-2 rounded-lg border border-border hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50" 
                aria-label="Open filters"
                disabled={!props.canUseFilters}
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile filters */}
        {showMobileFilters && (
          <div className="md:hidden border-t pt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center justify-between">
                  <span>{selectedStatus === 'all' ? 'All Status' : selectedStatus}</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuItem onClick={() => handleStatusChange('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Processing')}>
                    Processing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Shipped')}>
                    Shipped
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Delivered')}>
                    Delivered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Cancelled')}>
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center justify-between">
                  <span>{datePresets.find(d => d.value === selectedDateRange)?.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  {datePresets.map((preset) => (
                    <DropdownMenuItem 
                      key={preset.value}
                      onClick={() => handleDateRangeChange(preset.value)}
                    >
                      {preset.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}