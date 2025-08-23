"use client";

import { cn } from "@/lib/utils/util";
import AnalyticsCard from "./AnalyticsCard";

interface AnalyticsData {
  revenue: {
    current: number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  };
  sales: {
    current: number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  };
  lowStock: {
    count: number;
    onRestockClick?: () => void;
  };
  products: {
    active: number;
    total: number;
    newThisWeek?: number;
  };
}

interface AnalyticsGridProps {
  data: AnalyticsData;
  isLoading?: boolean;
  isFetching?: boolean;
  className?: string;
}

export default function AnalyticsGrid({
  data,
  isLoading = false,
  isFetching = false,
  className
}: AnalyticsGridProps) {
  if (isLoading) {
    return (
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-3",
        className
      )}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl border animate-pulse"
          >
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 bg-muted rounded animate-pulse w-20" />
                  <div className="h-5 bg-muted rounded animate-pulse w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 gap-3",
      "auto-rows-fr", // Ensures equal height cards
      "transition-opacity duration-200",
      isFetching && "opacity-75", // Subtle indication when refreshing
      className
    )}>
      {/* Low Stock Alert - Top Left (Priority Position - Option A) */}
      <AnalyticsCard
        title="Low Stock Alerts"
        value={data.lowStock.count === 0 ? "All good!" : `${data.lowStock.count} items`}
        variant={data.lowStock.count > 0 ? "warning" : "info"}
        action={data.lowStock.count > 0 ? {
          label: data.lowStock.count === 1 ? "Restock Item" : "Restock Items",
          onClick: data.lowStock.onRestockClick
        } : undefined}
        className="order-1"
      />

      {/* Sales Card - Top Right (Secondary Priority) */}
      <AnalyticsCard
        title="Total Sales"
        value={`${data.sales.current.toLocaleString()} orders`}
        change={data.sales.change ? {
          value: data.sales.change,
          trend: data.sales.trend || 'neutral'
        } : undefined}
        variant="sales"
        className="order-2"
      />

      {/* Revenue Card - Bottom Left (Business Metric) */}
      <AnalyticsCard
        title="Total Revenue"
        value={data.revenue.current}
        change={data.revenue.change ? {
          value: data.revenue.change,
          trend: data.revenue.trend || 'neutral'
        } : undefined}
        variant="revenue"
        className="order-3"
      />

      {/* Active Products - Bottom Right (Informational) */}
      <AnalyticsCard
        title="Active Products"
        value={`${data.products.active} items`}
        change={data.products.newThisWeek ? {
          value: data.products.newThisWeek,
          trend: 'up'
        } : undefined}
        variant="info"
        className="order-4"
      />
    </div>
  );
}