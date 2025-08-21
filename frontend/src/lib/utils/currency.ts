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
    let amountInTHB: number;
    
    if (fromCurrency === 'THB') {
      amountInTHB = amount;
    } else {
      // Convert from foreign currency to THB: amount * rate
      const fromRate = exchangeRates[fromCurrency];
      if (!fromRate || isNaN(fromRate)) return amount; // Fallback if rate not found
      amountInTHB = amount * fromRate;
    }
    
    if (toCurrency === 'THB') {
      return amountInTHB;
    } else {
      // Convert from THB to target currency: THB amount ÷ rate
      const toRate = exchangeRates[toCurrency];
      if (!toRate || isNaN(toRate)) return amountInTHB; // Fallback to THB if rate not found
      return amountInTHB / toRate;
    }
  } catch (error) {
    console.warn('Currency conversion error:', error);
    return amount; // Return original amount if conversion fails
  }
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${amount.toLocaleString()} ${currency}`;
  }
}
