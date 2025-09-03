"use client";

import { cn } from "@/lib/utils/util";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Whether this page needs full height (for pages with minimal content) */
  fullHeight?: boolean;
  /** Custom padding top override (use sparingly) */
  customPadding?: string;
}

/**
 * PageLayout component provides consistent navbar offset for all pages
 * 
 * Navbar heights (measured):
 * - Desktop: 64px (h-16 only)
 * - Mobile: ~100px (h-16 + mobile search bar + padding)
 * 
 * Using slightly less padding to avoid excessive whitespace:
 * - Mobile: 88px (pt-22)
 * - Desktop: 72px (sm:pt-18) - adds small buffer for comfort
 */
export function PageLayout({ 
  children, 
  className, 
  fullHeight = false,
  customPadding 
}: PageLayoutProps) {
  return (
    <div 
      className={cn(
        // Optimized navbar offset: 88px mobile (pt-22), 72px desktop (sm:pt-18)
        customPadding || "pt-28 sm:pt-14",
        fullHeight && "min-h-screen",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Utility classes for consistent navbar spacing
 * Use these when you can't use the PageLayout component
 */
export const NAVBAR_OFFSET_CLASSES = "pt-28 sm:pt-18";
export const NAVBAR_OFFSET_FULL_HEIGHT = `min-h-screen ${NAVBAR_OFFSET_CLASSES}`;