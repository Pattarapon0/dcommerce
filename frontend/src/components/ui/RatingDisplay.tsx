"use client";

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showReviewCount?: boolean;
}

export default function RatingDisplay({ 
  rating, 
  reviewCount, 
  size = 'md',
  showReviewCount = true
}: RatingDisplayProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Full stars */}
      {Array(fullStars).fill(0).map((_, i) => (
        <span key={`full-${i}`} className="text-yellow-500">
          ★
        </span>
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <span className="text-yellow-500 relative">
          <span className="text-gray-300 absolute">★</span>
          <span className="overflow-hidden inline-block w-1/2">★</span>
        </span>
      )}
      
      {/* Empty stars */}
      {Array(emptyStars).fill(0).map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300">
          ★
        </span>
      ))}
      
      {/* Rating number */}
      <span className={`font-medium ${sizeClasses[size]}`}>
        {rating.toFixed(1)}
      </span>
      
      {/* Review count */}
      {showReviewCount && reviewCount && (
        <span className={`text-muted-foreground ${sizeClasses[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
