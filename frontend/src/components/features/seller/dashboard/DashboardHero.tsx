"use client";

import { cn } from "@/lib/utils/util";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles,
  TrendingUp,
  Star,
  Zap,
  Heart,
  Sun,
  Moon
} from "lucide-react";

interface DashboardHeroProps {
  businessName: string;
  subtitle?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  performanceLevel?: 'excellent' | 'good' | 'average' | 'needs-attention';
  totalSales?: number;
  onQuickAction?: () => void;
  isLoading?: boolean;
  className?: string;
}

const timeGreetings = {
  morning: {
    text: "Good morning",
    icon: Sun,
    gradient: "from-amber-500/20 via-orange-400/10 to-yellow-300/5",
    accent: "text-amber-600",
  },
  afternoon: {
    text: "Good afternoon", 
    icon: Sun,
    gradient: "from-blue-500/20 via-sky-400/10 to-cyan-300/5",
    accent: "text-blue-600",
  },
  evening: {
    text: "Good evening",
    icon: Moon,
    gradient: "from-purple-500/20 via-indigo-400/10 to-blue-300/5",
    accent: "text-purple-600",
  },
};

const performanceConfig = {
  excellent: {
    badge: { text: "🏆 Top Performer", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    icon: Star,
    message: "Your business is thriving! Keep up the excellent work.",
  },
  good: {
    badge: { text: "📈 Growing Strong", color: "bg-blue-100 text-blue-700 border-blue-200" },
    icon: TrendingUp,
    message: "Great progress! Your sales are trending upward.",
  },
  average: {
    badge: { text: "⚡ Building Momentum", color: "bg-orange-100 text-orange-700 border-orange-200" },
    icon: Zap,
    message: "You're on the right track. Let's boost those numbers!",
  },
  'needs-attention': {
    badge: { text: "🎯 Focus Mode", color: "bg-purple-100 text-purple-700 border-purple-200" },
    icon: Heart,
    message: "Every expert was once a beginner. Let's grow together!",
  },
};

export default function DashboardHero({
  businessName,
  subtitle,
  timeOfDay = 'morning',
  performanceLevel = 'good',
  totalSales,
  onQuickAction,
  //isLoading = false,
  className
}: DashboardHeroProps) {
  const greeting = timeGreetings[timeOfDay];
  const performance = performanceConfig[performanceLevel];
  const TimeIcon = greeting.icon;
  const PerformanceIcon = performance.icon;

  const getCurrentTime = () => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  };

  const getPersonalizedMessage = () => {
    if (subtitle) return subtitle;
    return performance.message;
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4",
      "from-background via-background/95 to-muted/30",
      greeting.gradient,
      className
    )}>
      {/* Simplified background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23f8fafc\' fill-opacity=\'0.02\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
      
      {/* Single sparkle accent */}
      <div className="absolute top-3 right-3">
        <Sparkles className="w-4 h-4 text-primary/25 animate-pulse" />
      </div>

      <div className="relative">
        {/* Compact header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg bg-white/80 backdrop-blur-sm border border-white/20 shadow-sm",
              greeting.accent
            )}>
              <TimeIcon className="w-4 h-4" />
            </div>
            
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={cn("text-xs font-medium", greeting.accent)}>
                  {greeting.text}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getCurrentTime()}
                </span>
              </div>
            </div>
          </div>

          {/* Consolidated badges */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "px-2 py-1 text-xs font-medium shadow-sm backdrop-blur-sm",
                performance.badge.color
              )}
            >
              <PerformanceIcon className="w-3 h-3 mr-1" />
              {performance.badge.text}
            </Badge>
          </div>
        </div>

        {/* Compact main content */}
        <div className="space-y-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
              Welcome back, {' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {businessName}
              </span>
              !
            </h1>
            
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {getPersonalizedMessage()}
            </p>
          </div>

          {/* Inline quick stats and action */}
          <div className="flex items-center justify-between">
            {!!totalSales && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    {totalSales.toLocaleString()} sales
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">
                    Growing
                  </span>
                </div>
              </div>
            )}

            {/* Compact quick action button */}
            {onQuickAction && (
              <Button
                onClick={onQuickAction}
                variant="ghost"
                size="sm"
                className="group h-7 px-3 text-xs font-medium transition-all duration-300"
              >
                <Zap className="w-3 h-3 mr-1.5" />
                Quick Actions
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-primary/3 opacity-50 pointer-events-none" />
    </div>
  );
}