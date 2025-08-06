export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images?: string[];
  category: string;
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  stockCount?: number;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

export interface Seller {
  id: string;
  name: string;
  description: string;
  avatar: string;
  rating: number;
  productCount: number;
  location?: string;
}

export enum Currency {
  THB = "THB",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  AUD = "AUD",
  CAD = "CAD",
  SGD = "SGD"
}

// Export as array for Valibot and other validation needs
export const CURRENCIES = Object.values(Currency) as const
export type CurrencyValues = typeof CURRENCIES[number]

// Currency information mapping for UI display
export const CURRENCY_INFO = {
  THB: {
    code: "THB",
    name: "Thai Baht",
    symbol: "฿",
    flag: "🇹🇭"
  },
  USD: {
    code: "USD", 
    name: "US Dollar",
    symbol: "$",
    flag: "🇺🇸"
  },
  EUR: {
    code: "EUR",
    name: "Euro", 
    symbol: "€",
    flag: "🇪🇺"
  },
  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    flag: "🇬🇧"
  },
  JPY: {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    flag: "🇯🇵"
  },
  AUD: {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    flag: "🇦🇺"
  },
  CAD: {
    code: "CAD",
    name: "Canadian Dollar", 
    symbol: "C$",
    flag: "🇨🇦"
  },
  SGD: {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    flag: "🇸🇬"
  }
} as const

// Utility functions
export const getCurrencyInfo = (currency: Currency) => CURRENCY_INFO[currency]
export const formatCurrency = (amount: number, currency: Currency) => {
  const info = CURRENCY_INFO[currency]
  return `${info.symbol}${amount.toLocaleString()}`
}