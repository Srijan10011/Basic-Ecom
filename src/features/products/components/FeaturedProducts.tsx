import React, { useMemo } from 'react';

import { useProductsRatingsQuery } from '../hooks/productRatingHooks';
import StarRating from '../../../shared/components/ui/StarRating';
import { useFeaturedProductsQuery } from '../hooks/useProductsQuery';
import ProductCard from './ProductCard';



export default function FeaturedProducts({ setCurrentPage, setSelectedProductId, addToCart, addingToCartId }: { setCurrentPage: (page: string) => void; setSelectedProductId: (id: number) => void; addToCart: (product: any) => void; addingToCartId: number | null }) {
  const { data: products = [], isLoading: loading, error } = useFeaturedProductsQuery();

  // Get product IDs for rating queries
  const productIds = useMemo(() => products.map(p => p.id), [products]);
  
  // Fetch ratings for all featured products
  const { 
    data: productRatings = [], 
    isLoading: ratingsLoading 
  } = useProductsRatingsQuery(productIds);

  // Create a map of product ratings for easy lookup
  const ratingsMap = useMemo(() => {
    const map = new Map();
    productRatings.forEach(rating => {
      map.set(rating.productId, rating);
    });
    return map;
  }, [productRatings]);

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 dark:text-gray-300">Error loading products: {error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our most popular mushroom products, carefully selected for
            quality and freshness
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {products && products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              rating={ratingsMap.get(product.id)}
              onProductClick={(id) => {
                setSelectedProductId(id);
                setCurrentPage('product-detail');
              }} 
              addToCart={addToCart} 
              isAddingToCart={addingToCartId === product.id}
            />
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={() => setCurrentPage('shop')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105">
            View All Products
          </button>
        </div>
      </div>
    </section>
 );
  }