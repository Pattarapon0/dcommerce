import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency conversion utilities
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>
): number {
  try {
    if (!amount || isNaN(amount)) return 0;
    if (!fromCurrency || !toCurrency) return amount;
    if (fromCurrency === toCurrency) return amount;
    if (!exchangeRates || typeof exchangeRates !== 'object') return amount;
    
    // All exchange rates use THB as base currency
    // exchangeRates[currency] represents: 1 THB = rate * currency
    // e.g., USD: 0.027 means 1 THB = 0.027 USD, or 1 USD = 1/0.027 THB ≈ 37.04 THB
    let amountInTHB: number;
    
    if (fromCurrency === 'THB') {
      amountInTHB = amount;
    } else {
      // Convert from foreign currency to THB: amount ÷ rate
      // e.g., 100 USD = 100 ÷ 0.027 THB ≈ 3704 THB
      const fromRate = exchangeRates[fromCurrency];
      if (!fromRate || isNaN(fromRate) || fromRate === 0) return amount; // Fallback if rate not found
      amountInTHB = amount / fromRate;
    }
    
    if (toCurrency === 'THB') {
      return amountInTHB;
    } else {
      // Convert from THB to target currency: THB amount × rate
      // e.g., 1000 THB = 1000 × 0.027 USD = 27 USD
      const toRate = exchangeRates[toCurrency];
      if (!toRate || isNaN(toRate)) return amountInTHB; // Fallback to THB if rate not found
      return amountInTHB * toRate;
    }
  } catch {
    console.warn('Currency conversion error');
    return amount; // Return original amount if conversion fails
  }
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    if (currency === 'THB') {
      // Format THB the way people actually use it
      const formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      return `${formattedAmount} THB`;
    }
    
    // For other currencies, use standard formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies
    return `${amount.toLocaleString()} ${currency}`;
  }
}

// Compact currency formatting for UI components with space constraints
export function formatCurrencyCompact(amount: number, currency: string): string {
  try {
    if (currency === 'THB') {
      const formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0, // No decimals for compact format
      });
      return `${formattedAmount} THB`;
    }
    
    // For other currencies, use compact formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, // No decimals for compact format
      notation: 'compact', // Use compact notation for large numbers
    }).format(amount);
  } catch {
    // Fallback with currency code only
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formattedAmount} ${currency}`;
  }
}
