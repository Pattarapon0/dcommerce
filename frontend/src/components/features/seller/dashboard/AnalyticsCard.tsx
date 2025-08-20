"use client";

import { cn } from "@/lib/utils/util";
import {convertCurrency, formatCurrency} from "@/lib/utils/currency";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Package,
  ArrowRight
} from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  variant?: 'revenue' | 'sales' | 'warning' | 'info';
  action?: {
    label: string;
    onClick?: () => void;
  };
  className?: string;
  // Currency conversion props
  currency?: string; // Target currency (user's preferred)
  exchangeRates?: Record<string, number>;
}

const variantConfig = {
  revenue: {
    icon: DollarSign,
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    borderColor: "border-emerald-200/50",
  },
  sales: {
    icon: ShoppingCart,
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    borderColor: "border-blue-200/50",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-orange-500/15 via-orange-500/8 to-transparent",
    iconColor: "text-orange-700",
    iconBg: "bg-orange-200",
    borderColor: "border-orange-300/60",
  },
  info: {
    icon: Package,
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    borderColor: "border-purple-200/50",
  },
};

export default function AnalyticsCard({
  title,
  value,
  change,
  variant = 'info',
  action,
  className,
  currency = 'THB',
  exchangeRates = {}
}: AnalyticsCardProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = () => {
    if (!change) return '';
    
    switch (change.trend) {
      case 'up':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // Handle currency conversion for revenue
      if (variant === 'revenue') {
        const convertedAmount = convertCurrency(val, currency, exchangeRates);
        return formatCurrency(convertedAmount, currency);
      }
      
      if (val >= 1000) {
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(val);
      }
      
      return val.toLocaleString();
    }
    
    return val;
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        "border bg-gradient-to-br p-0", // Override any default padding
        config.gradient,
        config.borderColor,
        variant === 'warning' && "ring-1 ring-orange-300/40 shadow-lg", // Enhanced urgency for warnings
        className
      )}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&#39;20&#39; height=&#39;20&#39; viewBox=&#39;0 0 20 20&#39; xmlns=&#39;http://www.w3.org/2000/svg&#39;%3E%3Cg fill=%27%23f8fafc%27 fill-opacity=%270.03%27%3E%3Ccircle cx=%273%27 cy=%273%27 r=%273%27/%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 group-hover:scale-110",
              config.iconBg
            )}>
              <IconComponent className={cn("w-5 h-5", config.iconColor)} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground/80 uppercase tracking-wide">{title}</p>
              <p className={cn(
                "text-lg font-bold tracking-tight leading-tight",
                variant === 'warning' && "text-orange-800" // Darker text for warning urgency
              )}>
                {formatValue(value)}
              </p>
            </div>
          </div>
          
          {change && (
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1 px-2 py-0.5 text-xs font-semibold border transition-all duration-300",
                getTrendColor()
              )}
            >
              {getTrendIcon()}
              {Math.abs(change.value)}%
            </Badge>
          )}
        </div>

        {action && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-between h-7 text-xs font-medium transition-all duration-300 mt-1 px-2 py-1", // Override button padding
              "hover:bg-white/50 hover:shadow-sm",
              variant === 'warning' && "text-orange-700 hover:text-orange-800 hover:bg-orange-50"
            )}
            onClick={action.onClick}
          >
            <span>{action.label}</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </Button>
        )}

        {!action && change && (
          <div className="pt-1 border-t border-border/30 mt-1">
            <span className="text-xs text-muted-foreground/80">
              {change.trend === 'up' ? 'Increase' : change.trend === 'down' ? 'Decrease' : 'No change'} from last period
            </span>
          </div>
        )}
      </div>

      {/* Enhanced glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-10",
          variant === 'revenue' && "from-emerald-400 to-emerald-600",
          variant === 'sales' && "from-blue-400 to-blue-600",
          variant === 'warning' && "from-orange-400 to-orange-600",
          variant === 'info' && "from-purple-400 to-purple-600"
        )} />
      </div>
    </Card>
  );
}