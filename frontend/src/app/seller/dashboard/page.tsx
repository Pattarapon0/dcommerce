"use client";

import DashboardHero from "@/components/features/seller/dashboard/DashboardHero";
import AnalyticsGrid from "@/components/features/seller/dashboard/AnalyticsGrid";
import QuickActions from "@/components/features/seller/dashboard/QuickActions";

// Demo data for dashboard
const DEMO_DATA = {
  businessName: "Your Business",
  analytics: {
    revenue: {
      current: 2450,
      change: 12,
      trend: 'up' as const,
    },
    sales: {
      current: 127,
      change: 8,
      trend: 'up' as const,
    },
    lowStock: {
      count: 3,
      onRestockClick: () => {
        alert('Products management coming soon!');
      },
    },
    products: {
      active: 24,
      total: 28,
      newThisWeek: 2,
    },
  },
  stats: {
    totalSales: 1247,
    productCount: 24,
    orderCount: 8,
    hasNewOrders: true,
    hasLowStock: true,
  },
  timeOfDay: (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning' as const;
    if (hour < 18) return 'afternoon' as const;
    return 'evening' as const;
  })(),
  isVerified: true,
  performanceLevel: 'good' as const,
};

export default function SellerDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-3">
        {/* Hero Section */}
        <div className="mb-8">
          <DashboardHero
            businessName={DEMO_DATA.businessName}
            timeOfDay={DEMO_DATA.timeOfDay}
            isVerified={DEMO_DATA.isVerified}
            performanceLevel={DEMO_DATA.performanceLevel}
            totalSales={DEMO_DATA.stats.totalSales}
            onQuickAction={() => alert('Quick actions coming soon!')}
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
              data={DEMO_DATA.analytics}
              isLoading={false}
            />
          </div>

          {/* Right Column - Quick Actions */}
          <div>
            <QuickActions
              onManageProducts={() => alert('Product management coming soon!')}
              onViewOrders={() => alert('Order management coming soon!')}
              onAddProduct={() => alert('Add product coming soon!')}
              onProfileSettings={() => alert('Profile settings coming soon!')}
              productCount={DEMO_DATA.stats.productCount}
              orderCount={DEMO_DATA.stats.orderCount}
              hasNewOrders={DEMO_DATA.stats.hasNewOrders}
              hasLowStock={DEMO_DATA.stats.hasLowStock}
              className="sticky top-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}