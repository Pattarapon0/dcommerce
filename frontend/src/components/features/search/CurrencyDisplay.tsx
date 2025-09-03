"use client";

import { formatCurrency, convertCurrency } from "@/lib/utils/currency";

interface CurrencyDisplayProps {
  price: number;
  originalCurrency: string;
  userPreferredCurrency?: string;
  exchangeRates?: Record<string, number>;
  className?: string;
}

export function CurrencyDisplay({
  price,
  originalCurrency,
  userPreferredCurrency = "THB",
  exchangeRates,
  className = ""
}: CurrencyDisplayProps) {
  const showConversion = 
    userPreferredCurrency !== originalCurrency && 
    exchangeRates && 
    Object.keys(exchangeRates).length > 0;

  const convertedPrice = showConversion 
    ? convertCurrency(price, originalCurrency, userPreferredCurrency, exchangeRates!)
    : price;
  const displayCurrency = showConversion ? userPreferredCurrency : originalCurrency;

  return (
    <div className={className}>
      {/* Primary Price Display */}
      <div className="text-lg font-bold text-gray-900">
        {formatCurrency(convertedPrice, displayCurrency)}
      </div>

      {/* Original Price with Conversion Info */}
      {showConversion && originalCurrency !== userPreferredCurrency && (
        <div className="text-xs text-gray-500 mt-1">
          {formatCurrency(price, originalCurrency)}
        </div>
      )}

      {/* Fallback when no conversion available */}
      {userPreferredCurrency !== originalCurrency && !exchangeRates && (
        <div className="text-xs text-gray-500 mt-1">
          Price in {originalCurrency}
        </div>
      )}
    </div>
  );
}

interface FeaturedCurrencyDisplayProps {
  price: number;
  originalCurrency: string;
  userPreferredCurrency?: string;
  exchangeRates?: Record<string, number>;
  className?: string;
}

export function FeaturedCurrencyDisplay({
  price,
  originalCurrency,
  userPreferredCurrency = "THB",
  exchangeRates,
  className = ""
}: FeaturedCurrencyDisplayProps) {
  const showConversion = 
    userPreferredCurrency !== originalCurrency && 
    exchangeRates && 
    Object.keys(exchangeRates).length > 0;

  const convertedPrice = showConversion 
    ? convertCurrency(price, originalCurrency, userPreferredCurrency, exchangeRates!)
    : price;
  const displayCurrency = showConversion ? userPreferredCurrency : originalCurrency;

  return (
    <div className={className}>
      {/* Primary Price Display */}
      <div className="text-2xl lg:text-3xl font-bold text-gray-900">
        {formatCurrency(convertedPrice, displayCurrency)}
      </div>

      {/* Original Price with Conversion Info */}
      {showConversion && originalCurrency !== userPreferredCurrency && (
        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
          <span>{formatCurrency(price, originalCurrency)}</span>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
            Converted from {originalCurrency}
          </span>
        </div>
      )}

      {/* Fallback when no conversion available */}
      {userPreferredCurrency !== originalCurrency && !exchangeRates && (
        <div className="text-sm text-gray-500 mt-1">
          Price shown in {originalCurrency}
        </div>
      )}
    </div>
  );
}