"use client";

import { cn } from "@/lib/utils/util";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig = {
  Pending: {
    dot: "bg-amber-600",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200"
  },
  Processing: {
    dot: "bg-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200"
  },
  Shipped: {
    dot: "bg-green-600", 
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-200"
  },
  Delivered: {
    dot: "bg-emerald-600",
    bg: "bg-emerald-50", 
    text: "text-emerald-700",
    ring: "ring-emerald-200"
  },
  Cancelled: {
    dot: "bg-red-600",
    bg: "bg-red-50",
    text: "text-red-700", 
    ring: "ring-red-200"
  },
  Closed: {
    dot: "bg-gray-600",
    bg: "bg-gray-50",
    text: "text-gray-700",
    ring: "ring-gray-200"
  },
  Paid: {
    dot: "bg-green-600",
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-200"
  },
  Refunded: {
    dot: "bg-orange-600",
    bg: "bg-orange-50",
    text: "text-orange-700",
    ring: "ring-orange-200"
  }
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Processing;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ring-1",
      config.bg,
      config.text,
      config.ring,
      className
    )}>
      <span className={cn("w-2 h-2 rounded-full", config.dot)}></span>
      {status}
    </span>
  );
}