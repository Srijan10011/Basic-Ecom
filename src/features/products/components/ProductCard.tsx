import React from 'react';
import { Product } from '../../../types';
import StarRating from '../../../shared/components/ui/StarRating';

interface ProductCardProps {
  product: Product;
  onProductClick: (id: number) => void;
  addToCart: (product: Product) => void;
  rating?: { averageRating: number; reviewCount: number };
  isAddingToCart: boolean;
  cart?:any[];
}

const ProductCard = React.memo(({ product, onProductClick, addToCart, rating, isAddingToCart, cart }: ProductCardProps) => {
  const outOfStock = product.stockquantity === 0;
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
          {outOfStock && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
               <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                 Out of Stock
               </span>
             </div>)}
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
        {/* Get current quantity in cart for this product */}
        {(() => {
          const cartItem = cart?.find(i => i.id === product.id);
          const currentQtyInCart = cartItem ? cartItem.quantity : 0;
          const canAddMore = currentQtyInCart + 1 <= (product.stockquantity ?? 0);
          const disabled = isAddingToCart || outOfStock || !canAddMore;

          return (
            <button
              onClick={() => addToCart(product)}
              disabled={disabled}
              className={`w-full py-2 sm:py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 disabled:transform-none text-xs sm:text-base ${
                outOfStock
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : disabled
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {outOfStock ? 'Out of Stock' : disabled ? `Only ${product.stockquantity} available` : isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          );
        })()}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;