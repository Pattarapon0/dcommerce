"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'rectangular' | 'text';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

function Skeleton({ 
  className, 
  variant = 'default',
  animation = 'pulse',
  width,
  height,
  ...props 
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'text':
        return 'rounded-sm h-4';
      default:
        return 'rounded-md';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-wave bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]';
      case 'none':
        return 'bg-muted';
      default:
        return 'animate-pulse bg-muted';
    }
  };

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  };

  return (
    <div
      className={cn(
        getAnimationClasses(),
        getVariantClasses(),
        variant === 'default' && 'h-4 w-full',
        className
      )}
      style={style}
      {...props}
    />
  );
}

interface DashboardSkeletonProps {
  className?: string;
}

function DashboardHeroSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-8",
      "from-muted/20 via-muted/10 to-transparent",
      className
    )}>
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="space-y-2">
              <Skeleton width={120} height={16} />
              <Skeleton width={80} height={12} />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Skeleton width={120} height={28} className="rounded-full" />
            <Skeleton width={80} height={28} className="rounded-full" />
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-4">
          <div className="space-y-3">
            <Skeleton width="60%" height={40} />
            <Skeleton width="80%" height={20} />
          </div>
          
          <div className="flex items-center gap-6 pt-2">
            <Skeleton width={120} height={16} />
            <Skeleton width={80} height={16} />
          </div>
          
          <div className="pt-4">
            <Skeleton width={140} height={40} className="rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface AnalyticsCardSkeletonProps {
  className?: string;
}

function AnalyticsCardSkeleton({ className }: AnalyticsCardSkeletonProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-gradient-to-br from-muted/20 to-transparent p-6",
      className
    )}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="space-y-2 flex-1">
              <Skeleton width={100} height={14} />
              <Skeleton width={120} height={24} />
            </div>
          </div>
          <Skeleton width={60} height={24} className="rounded-full" />
        </div>
        
        <Skeleton width="100%" height={36} className="rounded-lg" />
      </div>
    </div>
  );
}

interface ActionCardSkeletonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
}

function ActionCardSkeleton({ className, variant = 'secondary' }: ActionCardSkeletonProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-gradient-to-br from-muted/20 to-transparent p-6",
      variant === 'primary' && "bg-gradient-to-br from-primary/5 to-transparent",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton width={140} height={20} />
              <Skeleton width={60} height={20} className="rounded-full" />
            </div>
            <Skeleton width="90%" height={16} />
            <Skeleton width="70%" height={16} />
          </div>
        </div>
        <Skeleton variant="circular" width={20} height={20} />
      </div>
    </div>
  );
}

interface QuickActionsSkeletonProps {
  className?: string;
}

function QuickActionsSkeleton({ className }: QuickActionsSkeletonProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton width={160} height={28} />
          <Skeleton width={200} height={16} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={8} height={8} />
          <Skeleton width={140} height={14} />
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton width={120} height={14} />
        </div>
        
        <div className="space-y-4">
          <ActionCardSkeleton variant="primary" />
          <ActionCardSkeleton variant="primary" />
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton width={100} height={14} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCardSkeleton />
          <ActionCardSkeleton />
          <ActionCardSkeleton />
          <ActionCardSkeleton />
        </div>
      </div>

      {/* Help Section */}
      <div className="p-6 rounded-xl bg-muted/20 border">
        <div className="flex items-start gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-3">
            <Skeleton width={200} height={18} />
            <Skeleton width="100%" height={14} />
            <Skeleton width="80%" height={14} />
            <div className="flex items-center gap-3 pt-1">
              <Skeleton width={100} height={14} />
              <Skeleton width={1} height={14} />
              <Skeleton width={120} height={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardSkeletonLayoutProps {
  className?: string;
}

function DashboardSkeletonLayout({ className }: DashboardSkeletonLayoutProps) {
  return (
    <div className={cn("space-y-8 p-8", className)}>
      {/* Hero Section */}
      <DashboardHeroSkeleton />
      
      {/* Analytics Grid */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton width={180} height={28} />
          <Skeleton width={240} height={16} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnalyticsCardSkeleton />
          <AnalyticsCardSkeleton />
          <AnalyticsCardSkeleton />
          <AnalyticsCardSkeleton />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsSkeleton />
    </div>
  );
}

export {
  Skeleton,
  DashboardHeroSkeleton,
  AnalyticsCardSkeleton,
  ActionCardSkeleton,
  QuickActionsSkeleton,
  DashboardSkeletonLayout
};