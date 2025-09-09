"use client";

import React from "react";
import { cn } from "@/lib/utils/util";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  Package,
  ShoppingBag,
  Plus,
  Settings,
  TrendingUp,
  Star,
  Zap
} from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  priority?: 'high' | 'medium' | 'low';
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'new';
  };
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const variantConfig = {
  primary: {
    container: "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent border-primary/20 hover:border-primary/30",
    content: "group-hover:bg-primary/5",
    icon: "bg-primary/10 text-primary group-hover:bg-primary/15 group-hover:scale-110",
    title: "text-foreground group-hover:text-primary",
    description: "text-muted-foreground",
    arrow: "text-primary group-hover:translate-x-1",
    glow: "from-primary/20 to-primary/5",
  },
  secondary: {
    container: "bg-gradient-to-br from-muted/50 via-muted/20 to-transparent border-border hover:border-border/60",
    content: "group-hover:bg-muted/30",
    icon: "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:scale-105",
    title: "text-foreground group-hover:text-foreground/90",
    description: "text-muted-foreground",
    arrow: "text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground",
    glow: "from-muted/30 to-muted/10",
  },
};

const iconMap = {
  package: Package,
  shopping: ShoppingBag,
  plus: Plus,
  settings: Settings,
  trending: TrendingUp,
  star: Star,
  zap: Zap,
};

export default function ActionCard({
  title,
  description,
  icon,
  variant = 'secondary',
  priority = 'medium',
  badge,
  href,
  onClick,
  className,
  disabled = false
}: ActionCardProps) {
  const config = variantConfig[variant];
  
  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const getBadgeVariant = (badgeVariant?: string) => {
    switch (badgeVariant) {
      case 'success':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer p-0", // Override any default padding
        "hover:shadow-lg hover:-translate-y-0.5",
        config.container,
        priority === 'high' && "ring-1 ring-primary/20",
        disabled && "opacity-60 cursor-not-allowed hover:shadow-sm hover:translate-y-0",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`${title} - ${description}`}
      aria-disabled={disabled}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=\'60\'%20height=\'60\'%20viewBox=\'0%200%2060%2060\'%20xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg%20fill=\'none\'%20fill-rule=\'evenodd\'%3E%3Cg%20fill=\'%23f1f5f9\'%20fill-opacity=\'0.02\'%3E%3Cpath%20d=\'M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />

      <div className="p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {icon && (
              <div className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 shrink-0",
                config.icon
              )}>
                {typeof icon === 'string' && iconMap[icon as keyof typeof iconMap] ? 
                  React.createElement(iconMap[icon as keyof typeof iconMap], { className: "w-3.5 h-3.5" }) :
                  icon
                }
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className={cn(
                  "font-semibold text-sm transition-colors duration-300 truncate",
                  config.title
                )}>
                  {title}
                </h3>
                
                {badge && (
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-xs px-1 py-0 font-medium shrink-0",
                      getBadgeVariant(badge.variant)
                    )}
                  >
                    {badge.text}
                  </Badge>
                )}
              </div>
              
              <p className={cn(
                "text-xs leading-tight transition-colors duration-300 line-clamp-1 mt-0.5",
                config.description
              )}>
                {description}
              </p>
            </div>
          </div>

          <ArrowRight className={cn(
            "w-3.5 h-3.5 transition-all duration-300 shrink-0 ml-2",
            config.arrow
          )} />
        </div>

        {(variant === 'primary' || (priority === 'high' && variant === 'secondary')) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <div className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" />
            <span>{variant === 'primary' ? 'Priority action' : 'Recommended'}</span>
          </div>
        )}
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-5",
          config.glow
        )} />
      </div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Disabled overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] pointer-events-none" />
      )}
    </Card>
  );
}