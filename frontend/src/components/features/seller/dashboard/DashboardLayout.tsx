"use client";

import { cn } from "@/lib/utils";
import DashboardHero from "./DashboardHero";
import AnalyticsGrid from "./AnalyticsGrid";
import QuickActions from "./QuickActions";
import { DashboardSkeletonLayout } from "./SkeletonLoader";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DashboardData {
  businessName: string;
  analytics: {
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
  };
  stats: {
    totalSales?: number;
    productCount?: number;
    orderCount?: number;
    hasNewOrders?: boolean;
    hasLowStock?: boolean;
  };
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  isVerified?: boolean;
  performanceLevel?: 'excellent' | 'good' | 'average' | 'needs-attention';
}

interface DashboardLayoutProps {
  data?: DashboardData;
  isLoading?: boolean;
  error?: Error | null;
  isOnline?: boolean;
  onRetry?: () => void;
  onRefresh?: () => void;
  
  // Action handlers
  onManageProducts?: () => void;
  onViewOrders?: () => void;
  onAddProduct?: () => void;
  onProfileSettings?: () => void;
  onViewAnalytics?: () => void;
  onManageCustomers?: () => void;
  onQuickAction?: () => void;
  
  className?: string;
  children?: React.ReactNode;
}

export default function DashboardLayout({
  data,
  isLoading = false,
  error = null,
  isOnline = true,
  onRetry,
  onRefresh,
  onManageProducts,
  onViewOrders,
  onAddProduct,
  onProfileSettings,
  onViewAnalytics,
  onManageCustomers,
  onQuickAction,
  className,
  children
}: DashboardLayoutProps) {
  
  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <DashboardSkeletonLayout />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("min-h-screen bg-background p-8", className)}>
        <div className="max-w-6xl mx-auto">
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium text-destructive">Unable to load dashboard data</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {error.message || "Something went wrong. Please try again."}
                </p>
              </div>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="ml-4 shrink-0"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
          
          {/* Partial functionality - still show quick actions */}
          <div className="mt-8">
            <QuickActions
              onManageProducts={onManageProducts}
              onViewOrders={onViewOrders}
              onAddProduct={onAddProduct}
              onProfileSettings={onProfileSettings}
              onViewAnalytics={onViewAnalytics}
              onManageCustomers={onManageCustomers}
            />
          </div>
        </div>
      </div>
    );
  }

  // Success state with data
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="relative">
        {/* Offline indicator */}
        {!isOnline && (
          <div className="sticky top-0 z-50 bg-orange-500 text-white p-2 text-center text-sm font-medium">
            <div className="flex items-center justify-center gap-2">
              <WifiOff className="w-4 h-4" />
              You're offline. Some features may not be available.
            </div>
          </div>
        )}

        {/* Online indicator (subtle) */}
        {isOnline && (
          <div className="fixed top-4 right-4 z-40">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm border rounded-full shadow-sm">
              <Wifi className="w-3 h-3 text-emerald-600" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>
        )}

        {/* Refresh button */}
        {onRefresh && (
          <div className="fixed top-4 right-20 z-40">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="bg-background/80 backdrop-blur-sm shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Hero Section */}
          {data && (
            <DashboardHero
              businessName={data.businessName}
              timeOfDay={data.timeOfDay || getTimeOfDay()}
              isVerified={data.isVerified}
              performanceLevel={data.performanceLevel}
              totalSales={data.stats.totalSales}
              onQuickAction={onQuickAction}
            />
          )}

          {/* Analytics Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Business Overview
              </h2>
              <p className="text-muted-foreground mt-1">
                Track your key performance metrics
              </p>
            </div>
            
            {data && (
              <AnalyticsGrid
                data={data.analytics}
                isLoading={false}
              />
            )}
          </div>

          {/* Quick Actions Section */}
          <QuickActions
            onManageProducts={onManageProducts}
            onViewOrders={onViewOrders}
            onAddProduct={onAddProduct}
            onProfileSettings={onProfileSettings}
            onViewAnalytics={onViewAnalytics}
            onManageCustomers={onManageCustomers}
            productCount={data?.stats.productCount}
            orderCount={data?.stats.orderCount}
            hasNewOrders={data?.stats.hasNewOrders}
            hasLowStock={data?.stats.hasLowStock}
          />

          {/* Custom children content */}
          {children && (
            <div className="space-y-8">
              {children}
            </div>
          )}

          {/* Footer spacing */}
          <div className="h-16" />
        </div>
      </div>
    </div>
  );
}