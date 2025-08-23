"use client"

import * as React from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { cn } from "@/lib/utils/util"

// Product categories matching backend enum
export enum ProductCategory {
  Electronics = 0,
  Clothing = 1,
  Books = 2,
  Home = 3,
  Sports = 4,
  Other = 5
}

export const CATEGORY_INFO = {
  [ProductCategory.Electronics]: {
    name: "Electronics",
    icon: "📱",
    description: "Phones, computers, gadgets"
  },
  [ProductCategory.Clothing]: {
    name: "Clothing",
    icon: "👕",
    description: "Fashion, apparel, accessories"
  },
  [ProductCategory.Books]: {
    name: "Books",
    icon: "📚",
    description: "Books, magazines, educational"
  },
  [ProductCategory.Home]: {
    name: "Home",
    icon: "🏠",
    description: "Furniture, decor, household"
  },
  [ProductCategory.Sports]: {
    name: "Sports",
    icon: "⚽",
    description: "Sports equipment, fitness"
  },
  [ProductCategory.Other]: {
    name: "Other",
    icon: "📦",
    description: "Miscellaneous products"
  }
} as const

export const CATEGORIES = Object.values(ProductCategory).filter(value => typeof value === 'number') as ProductCategory[]

interface CategorySelectProps extends 
  Omit<React.ComponentProps<typeof Select>, 'value' | 'onValueChange'> {
  value?: ProductCategory
  onValueChange: (value: ProductCategory) => void
  placeholder?: string
  error?: string
  className?: string
}

export function CategorySelect({ 
  value, 
  onValueChange, 
  placeholder = "Select category",
  error,
  className,
  disabled = false,
  ...props
}: CategorySelectProps) {
  return (
    <div className="space-y-2">
      <Select 
        value={value?.toString()} 
        onValueChange={(val) => onValueChange(parseInt(val) as ProductCategory)} 
        disabled={disabled}
        {...props}
      >
        <SelectTrigger className={cn(
          "w-full h-10",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}>
          <SelectValue placeholder={placeholder}>
            {value !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{CATEGORY_INFO[value].icon}</span>
                <span className="font-medium">{CATEGORY_INFO[value].name}</span>
                <span className="text-muted-foreground text-sm">({CATEGORY_INFO[value].description})</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((category) => {
            const info = CATEGORY_INFO[category]
            return (
              <SelectItem key={category} value={category.toString()}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.icon}</span>
                  <span className="font-medium">{info.name}</span>
                  <span className="text-muted-foreground text-sm">({info.description})</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}