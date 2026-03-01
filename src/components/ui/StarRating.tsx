import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  readonly = false,
  size = 'md',
  showValue = false,
  reviewCount
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} transition-colors ${
              readonly ? '' : 'cursor-pointer'
            } ${
              star <= (hoverRating || rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
            onClick={() => !readonly && onRatingChange?.(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
          />
        ))}
      </div>
      {showValue && (
        <span className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-300`}>
          ({rating.toFixed(1)})
          {reviewCount !== undefined && ` ${reviewCount} review${reviewCount !== 1 ? 's' : ''}`}
        </span>
      )}
    </div>
  );
};

export default StarRating;