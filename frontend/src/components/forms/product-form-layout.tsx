"use client"

import * as React from "react"
import { cn } from "@/lib/utils/util"

interface ProductFormLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ProductFormLayout({ children, className }: ProductFormLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50 action-bar-container", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

interface ProductFormMainProps {
  children: React.ReactNode
  className?: string
}

export function ProductFormMain({ children, className }: ProductFormMainProps) {
  return (
    <div className={cn("lg:col-span-7 space-y-3 lg:space-y-4 pb-6 lg:pb-0", className)}>
      {children}
    </div>
  )
}

interface ProductFormSidebarProps {
  children: React.ReactNode
  className?: string
}

export function ProductFormSidebar({ children, className }: ProductFormSidebarProps) {
  return (
    <div className={cn("lg:col-span-5 pb-24 lg:pb-0", className)}>
      <div className="lg:sticky lg:top-24 space-y-3 lg:space-y-4">
        {children}
      </div>
    </div>
  )
}

interface ProductFormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ProductFormSection({ 
  title, 
  description, 
  children, 
  className 
}: ProductFormSectionProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 overflow-hidden", className)}>
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="px-6 pb-6">
        {children}
      </div>
    </div>
  )
}