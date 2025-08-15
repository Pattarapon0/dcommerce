"use client";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
}

export default function PriceDisplay({ 
  price, 
  originalPrice, 
  currency = '$',
  size = 'md',
  showDiscount = true
}: PriceDisplayProps) {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  const originalSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`font-bold ${sizeClasses[size]}`}>
        {currency}{price.toFixed(2)}
      </span>
      
      {hasDiscount && (
        <>
          <span className={`text-muted-foreground line-through ${originalSizeClasses[size]}`}>
            {currency}{originalPrice.toFixed(2)}
          </span>
          
          {showDiscount && (
            <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full font-medium">
              -{discountPercentage}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
