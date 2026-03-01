import React from 'react';
import { Star } from 'lucide-react';
import { useProductReviewStatsQuery } from '../lib/reviewQueries';

interface ProductRatingProps {
  productId: number;
  showReviewCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

export default function ProductRating({ 
  productId, 
  showReviewCount = true, 
  size = 'md',
  readonly = true 
}: ProductRatingProps) {
  const { data: reviewStats, isLoading } = useProductReviewStatsQuery(productId);

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`${sizeClasses[size]} text-gray-300 animate-pulse`}
            />
          ))}
        </div>
        {showReviewCount && (
          <span className={`${textSizeClasses[size]} text-gray-400`}>Loading...</span>
        )}
      </div>
    );
  }

  const rating = reviewStats?.average_rating || 0;
  const reviewCount = reviewStats?.review_count || 0;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showReviewCount && (
        <span className={`${textSizeClasses[size]} text-gray-600`}>
          {rating > 0 ? `(${rating.toFixed(1)}) ${reviewCount} review${reviewCount !== 1 ? 's' : ''}` : 'No reviews yet'}
        </span>
      )}
    </div>
  );
}