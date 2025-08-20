import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency conversion utilities
export function convertCurrency(
  amountInTHB: number, 
  targetCurrency: string, 
  exchangeRates: Record<string, number>
): number {
  if (targetCurrency === 'THB') return amountInTHB;
  
  const rate = exchangeRates[targetCurrency];
  if (!rate) return amountInTHB; // Fallback to THB amount if rate not found
  
  // Convert THB to target currency: THB amount ÷ rate
  return amountInTHB / rate;
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
