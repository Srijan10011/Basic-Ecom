import React from 'react';
import { Product } from '../../../types';
import StarRating from '../../../shared/components/ui/StarRating';

interface ProductCardProps {
  product: Product;
  onProductClick: (id: number) => void;
  addToCart: (product: Product) => void;
  rating?: { averageRating: number; reviewCount: number };
  isAddingToCart: boolean;
}

const ProductCard = React.memo(({ product, onProductClick, addToCart, rating, isAddingToCart }: ProductCardProps) => {
  return (
    <div className="group bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 text-left w-full flex flex-col">
      <div className="relative aspect-w-1 aspect-h-1">
        <button onClick={() => onProductClick(product.id)} className="w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.badge && (
            <div className="absolute top-2 left-2">
              <span className={`${product.badge_color || 'bg-blue-500'} text-white px-2 py-1 rounded-full text-xs font-semibold`}>
                {product.badge}
              </span>
            </div>
          )}
        </button>
      </div>

      <div className="p-2 sm:p-4 flex-grow">
        <button onClick={() => onProductClick(product.id)} className="w-full text-left">
          <h3 className="text-sm sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {product.name}
          </h3>
        </button>

        <div className="flex items-center justify-between mb-2">
          <span className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white">Rs {product.price.toFixed(2)}</span>
          <StarRating
            rating={rating?.averageRating || 0}
            readonly
            size="xs"
            showValue
            reviewCount={rating?.reviewCount || 0}
          />
        </div>
      </div>

      <div className="p-2 sm:p-4 pt-0">
        <button
          onClick={() => addToCart(product)}
          disabled={isAddingToCart}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 sm:py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 disabled:transform-none text-xs sm:text-base"
        >
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;