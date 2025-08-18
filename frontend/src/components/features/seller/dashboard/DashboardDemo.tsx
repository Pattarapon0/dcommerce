"use client";

import DashboardLayout from "./DashboardLayout";

// Demo data to showcase the beautiful UI components
const DEMO_DATA = {
  businessName: "Artisan Crafts Co.",
  analytics: {
    revenue: {
      current: 12450,
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
      onRestockClick: () => console.log('Navigate to low stock products'),
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
  timeOfDay: 'morning' as const,
  isVerified: true,
  performanceLevel: 'excellent' as const,
};

export default function DashboardDemo() {
  const handleAction = (action: string) => {
    console.log(`${action} clicked - navigate to appropriate page`);
  };

  return (
    <DashboardLayout
      data={DEMO_DATA}
      isLoading={false}
      error={null}
      isOnline={true}
      onRetry={() => console.log('Retry loading data')}
      onRefresh={() => console.log('Refresh dashboard')}
      onManageProducts={() => handleAction('Manage Products')}
      onViewOrders={() => handleAction('View Orders')}
      onAddProduct={() => handleAction('Add Product')}
      onProfileSettings={() => handleAction('Profile Settings')}
      onViewAnalytics={() => handleAction('View Analytics')}
      onManageCustomers={() => handleAction('Manage Customers')}
      onQuickAction={() => handleAction('Quick Action')}
      className="bg-gradient-to-br from-background via-background to-muted/20"
    />
  );
}