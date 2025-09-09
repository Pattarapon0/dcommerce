"use client";

import DashboardHero from "@/components/features/seller/dashboard/DashboardHero";
import AnalyticsGrid from "@/components/features/seller/dashboard/AnalyticsGrid";
import QuickActions from "@/components/features/seller/dashboard/QuickActions";
import { useSellerDashboard } from "@/hooks/useSellerDashBoard";
import { userProfileAtom } from "@/stores/profile";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { useRouteGuard } from "@/hooks/useRouteGuard";

// Loading skeleton components
function DashboardLoadingSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-3">
        {/* Hero Skeleton */}
        <div className="mb-8">
          <div className="h-32 bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl border animate-pulse" />
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 -mt-4">
          {/* Analytics Skeleton */}
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-48" />
              <div className="h-3 bg-muted rounded animate-pulse w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl border animate-pulse" />
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-32" />
              <div className="h-3 bg-muted rounded animate-pulse w-40" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg border animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error state component
function DashboardErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Unable to load dashboard</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading your dashboard data. Please try again.
          </p>
          <Button onClick={onRetry}>Retry</Button>
        </div>
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  // Move hooks inside component
  const {isChecking} = useRouteGuard({
    allowedRoles: ['Seller'],
    unauthorizedRedirect: '/',
    customRedirects: {
      'Buyer': '/become-seller'
    }
  });
  const { data: dashboardData, isLoading, isFetching, error, refetch } = useSellerDashboard();
  const userProfile = useAtomValue(userProfileAtom);
  const businessName = userProfile.data?.BusinessName || "Your Business";
  
  // Sellers always see THB pricing for consistency

  // Early return for loading state
  if (isChecking && isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  // Early return for error state
  if (error) {
    return <DashboardErrorState onRetry={refetch} />;
  }

  // Early return for no data (shouldn't happen with your backend, but safety check)
  if (!dashboardData) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No data available</h2>
            <p className="text-muted-foreground mb-4">
              Unable to load dashboard data. Please try refreshing.
            </p>
            <Button onClick={() => refetch()}>Refresh</Button>
          </div>
        </div>
      </div>
    );
  }

  // Map real data to UI format (only when data exists)
  const analyticsData = {
    analytics: {
      revenue: {
        current: dashboardData.CurrentRevenue ?? 0,
        change: dashboardData.RevenueChangePercent,
        trend: (dashboardData.RevenueTrend as "neutral" | "up" | "down" | undefined) ?? "neutral",
      },
      sales: {
        current: dashboardData.CurrentSales ?? 0,
        change: dashboardData.SalesChangePercent,
        trend: (dashboardData.SalesTrend as "neutral" | "up" | "down" | undefined) ?? "neutral",
      },
      lowStock: {
        count: dashboardData.LowStockCount ?? 0,
        onRestockClick: () => {
          // TODO: Navigate to products page filtered by low stock
          console.log('Navigate to low stock products');
        },
      },
      products: {
        active: dashboardData.ActiveProducts ?? 0,
        total: dashboardData.TotalProducts ?? 0,
        newThisWeek: dashboardData.ProductsAddedThisWeek ?? 0,
      },
    },
    stats: {
      totalSales: dashboardData.CurrentSales,
      productCount: dashboardData.ActiveProducts,
      orderCount: dashboardData.PendingOrderCount,
      hasNewOrders: dashboardData.HasNewOrders,
      hasLowStock: dashboardData.HasLowStock,
    },
    timeOfDay: (() => {
      const hour = new Date().getHours();
      if (hour < 12) return 'morning' as const;
      if (hour < 18) return 'afternoon' as const;
      return 'evening' as const;
    })(),
    performanceLevel: 'good' as const,
  };
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-3">
        {/* Hero Section */}
        <div className="mb-8">
          <DashboardHero
            businessName={businessName}
            timeOfDay={analyticsData.timeOfDay}
            performanceLevel={analyticsData.performanceLevel}
            totalSales={analyticsData.stats.totalSales}
            isLoading={isFetching}
            // onQuickAction={() => console.log('Quick actions')} // Commented out for now
          />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 -mt-4">
          {/* Left Column - Analytics */}
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight mb-1">
                Business Overview
              </h2>
              <p className="text-sm text-muted-foreground">
                Track your key performance metrics
              </p>
            </div>
            <AnalyticsGrid
              data={analyticsData.analytics}
              isLoading={false} // Page-level loading handled by early return
              isFetching={isFetching} // For background refresh indicators
            />
          </div>

          {/* Right Column - Quick Actions */}
          <div>
            <QuickActions
              productCount={analyticsData.stats.productCount}
              orderCount={analyticsData.stats.orderCount}
              hasNewOrders={analyticsData.stats.hasNewOrders}
              hasLowStock={analyticsData.stats.hasLowStock}
              isFetching={isFetching}
              className="sticky top-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}