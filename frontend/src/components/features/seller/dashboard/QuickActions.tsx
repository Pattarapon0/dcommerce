"use client";

import { cn } from "@/lib/utils";
import ActionCard from "./ActionCard";
import { 
  Package,
  ShoppingBag,
  Plus,
  Settings,
  TrendingUp,
  Users,
  BarChart3,
  MessageSquare
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  priority?: 'high' | 'medium' | 'low';
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'new';
  };
  disabled?: boolean;
}

interface QuickActionsProps {
  onManageProducts?: () => void;
  onViewOrders?: () => void;
  onAddProduct?: () => void;
  onProfileSettings?: () => void;
  onViewAnalytics?: () => void;
  onManageCustomers?: () => void;
  productCount?: number;
  orderCount?: number;
  hasNewOrders?: boolean;
  hasLowStock?: boolean;
  className?: string;
}

export default function QuickActions({
  onManageProducts,
  onViewOrders,
  onAddProduct,
  onProfileSettings,
  onViewAnalytics,
  onManageCustomers,
  productCount = 0,
  orderCount = 0,
  hasNewOrders = false,
  hasLowStock = false,
  className
}: QuickActionsProps) {
  
  const primaryActions: QuickAction[] = [
    {
      id: 'manage-products',
      title: 'Manage Products',
      description: 'Add, edit, and organize your inventory',
      icon: <Package className="w-5 h-5" />,
      onClick: onManageProducts,
      href: '/seller/products',
      variant: 'primary',
      priority: 'high',
      badge: hasLowStock ? {
        text: 'Low Stock!',
        variant: 'warning'
      } : productCount > 0 ? {
        text: `${productCount}`,
        variant: 'default'
      } : undefined,
    },
    {
      id: 'view-orders',
      title: 'View Orders',
      description: 'Track and fulfill customer purchases',
      icon: <ShoppingBag className="w-5 h-5" />,
      onClick: onViewOrders,
      href: '/seller/orders',
      variant: 'primary',
      priority: 'high',
      badge: hasNewOrders ? {
        text: 'New!',
        variant: 'new'
      } : orderCount > 0 ? {
        text: `${orderCount}`,
        variant: 'default'
      } : undefined,
    },
  ];

  const secondaryActions: QuickAction[] = [
    {
      id: 'add-product',
      title: 'Add Product',
      description: 'List a new item',
      icon: <Plus className="w-5 h-5" />,
      onClick: onAddProduct,
      href: '/seller/products/new',
      variant: 'secondary',
      priority: 'medium',
    },
    {
      id: 'view-analytics',
      title: 'Analytics',
      description: 'View detailed reports',
      icon: <BarChart3 className="w-5 h-5" />,
      onClick: onViewAnalytics,
      href: '/seller/analytics',
      variant: 'secondary',
      priority: 'medium',
    },
    {
      id: 'profile-settings',
      title: 'Settings',
      description: 'Update business info',
      icon: <Settings className="w-5 h-5" />,
      onClick: onProfileSettings,
      href: '/seller/profile/edit',
      variant: 'secondary',
      priority: 'low',
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground mb-1">
          Quick Actions
        </h2>
        <p className="text-xs text-muted-foreground">
          Manage your business
        </p>
      </div>

      {/* Primary Actions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-primary">Daily Tasks</span>
        </div>
        
        <div className="space-y-1.5">
          {primaryActions.map((action) => (
            <ActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              icon={action.icon}
              variant={action.variant}
              priority={action.priority}
              badge={action.badge}
              href={action.href}
              onClick={action.onClick}
              disabled={action.disabled}
              className="w-full"
            />
          ))}
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">More Tools</span>
        </div>
        
        <div className="space-y-1.5">
          {secondaryActions.map((action) => (
            <ActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              icon={action.icon}
              variant={action.variant}
              priority={action.priority}
              badge={action.badge}
              href={action.href}
              onClick={action.onClick}
              disabled={action.disabled}
            />
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="p-2.5 rounded-lg bg-gradient-to-br from-muted/30 via-muted/10 to-transparent border border-border/50">
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-primary/10 text-primary shrink-0">
            <MessageSquare className="w-3 h-3" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground mb-1 text-xs">
              Need Help?
            </h3>
            <p className="text-xs text-muted-foreground mb-1.5 leading-relaxed">
              Check our seller guide or contact support.
            </p>
            
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                Guide
              </button>
              <span className="text-muted-foreground">·</span>
              <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}