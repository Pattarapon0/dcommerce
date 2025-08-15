"use client"

import * as React from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Currency, CURRENCIES, CURRENCY_INFO, getCurrencyInfo } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CurrencySelectProps extends 
  Omit<React.ComponentProps<typeof Select>, 'value' | 'onValueChange'> {
  value?: Currency
  onValueChange: (value: Currency) => void
  placeholder?: string
  error?: string
  className?: string
}

export function CurrencySelect({ 
  value, 
  onValueChange, 
  placeholder = "Select currency",
  error,
  className,
  disabled = false,
  ...props
}: CurrencySelectProps) {
  return (
    <div className="space-y-2">
      <Select 
        value={value} 
        onValueChange={onValueChange} 
        disabled={disabled}
        {...props}
      >
        <SelectTrigger className={cn(
          "w-full",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}>
          <SelectValue placeholder={placeholder}>
            {value && (
              <div className="flex items-center gap-2">
                <span>{CURRENCY_INFO[value].flag}</span>
                <span className="font-medium">{CURRENCY_INFO[value].symbol}</span>
                <span>{CURRENCY_INFO[value].name}</span>
                <span className="text-muted-foreground text-sm">({CURRENCY_INFO[value].code})</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((currency) => {
            const info = getCurrencyInfo(currency)
            return (
              <SelectItem key={currency} value={currency}>
                <div className="flex items-center gap-2">
                  <span>{info.flag}</span>
                  <span className="font-medium">{info.symbol}</span>
                  <span>{info.name}</span>
                  <span className="text-muted-foreground text-sm">({info.code})</span>
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