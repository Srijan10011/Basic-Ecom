import React, { useState, useEffect } from 'react';
import { supabase, retryOperation } from '../lib/supabaseClient';
import { useProductQuery } from '../lib/utils';
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, MapPin } from 'lucide-react';
import ReviewSection from './ReviewSection';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  categories: { id: number; name: string; slug: string };
  rating: number;
  stockQuantity: number;
  location: string;
}



interface ProductDetailProps {
  productId: number | null;
  setCurrentPage: (page: string) => void;
  addToCart: (product: any) => void;
  session?: any;
}

export default function ProductDetail({ productId, setCurrentPage, addToCart, session }: ProductDetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use React Query for data fetching with automatic refetching
  const { 
    data: product, 
    isLoading: productLoading, 
    error: productError,
    refetch: refetchProduct 
  } = useProductQuery(productId);

  // Manual refetch function
  const handleRefetch = async () => {
    setLoading(true);
    setError(null);
    try {
      await refetchProduct();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">Loading product details...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">Failed to load product details</p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{productError.message || 'An error occurred while loading the product.'}</p>
          <button
            onClick={handleRefetch}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Retrying...' : 'Retry Loading'}
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <p className="text-gray-600 dark:text-gray-300 text-lg">Product not found</p>
          <button
            onClick={() => setCurrentPage('shop')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mt-4"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setCurrentPage('shop')}
          className="mb-8 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400"
        >
          &larr; Back to Shop
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden lg:flex">
          <div className="lg:w-1/2 flex items-center justify-center p-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="lg:w-1/2 p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">({product.rating}/5)</span>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-200 text-lg mb-6 leading-relaxed">{product.description}</p>
            <p className="text-green-600 dark:text-green-400 text-3xl font-bold mb-6">Rs {product.price}</p>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Product Details</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>Category: {product.categories.name}</li>
                <li>Stock: {product.stockQuantity} units available</li>
                <li>Location: {product.location}</li>
              </ul>
            </div>

            <button onClick={() => addToCart(product)} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 transition-colors transform hover:scale-105">
              <ShoppingCart className="h-6 w-6" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

        {/* Review Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <ReviewSection 
              productId={product.id} 
              userId={session?.user?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}