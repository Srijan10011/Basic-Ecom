import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Shop from './components/Shop';
import ReviewSection from './components/ReviewSection';
import StarRating from './components/ui/StarRating';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
  },
});

// Mock data for demonstration
const mockProducts = [
  {
    id: 1,
    name: 'Premium Shiitake Mushrooms',
    description: 'Fresh, organic shiitake mushrooms perfect for cooking',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
    category: 'Fresh Mushrooms',
    badge: 'Organic',
    badgeColor: 'bg-green-500'
  },
  {
    id: 2,
    name: 'Lion\'s Mane Extract',
    description: 'High-quality lion\'s mane mushroom extract supplement',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
    category: 'Supplements',
    badge: 'Best Seller',
    badgeColor: 'bg-blue-500'
  }
];

function UnifiedRatingsDemo() {
  const [currentPage, setCurrentPage] = useState('shop');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-green-600">Unified Ratings Demo</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentPage('shop')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'shop'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Shop
                </button>
                <button
                  onClick={() => setCurrentPage('reviews')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'reviews'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Reviews Demo
                </button>
                <button
                  onClick={() => setCurrentPage('components')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'components'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Star Rating Components
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {currentPage === 'shop' && (
          <Shop 
            setCurrentPage={setCurrentPage}
            setSelectedProductId={setSelectedProductId}
            addToCart={addToCart}
          />
        )}

        {currentPage === 'reviews' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Product Reviews Demo</h2>
              <ReviewSection 
                productId={1} 
                userId="demo-user-123"
              />
            </div>
          </div>
        )}

        {currentPage === 'components' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Star Rating Component Variations</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Small Size (readonly)</h3>
                  <StarRating rating={4.2} readonly size="sm" showValue reviewCount={15} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Medium Size (readonly)</h3>
                  <StarRating rating={3.8} readonly size="md" showValue reviewCount={42} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Large Size (readonly)</h3>
                  <StarRating rating={4.7} readonly size="lg" showValue reviewCount={128} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Interactive Rating</h3>
                  <StarRating 
                    rating={0} 
                    onRatingChange={(rating) => console.log('Rating changed to:', rating)}
                    size="md"
                  />
                  <p className="text-sm text-gray-600 mt-2">Click stars to rate</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Without Review Count</h3>
                  <StarRating rating={4.5} readonly size="md" showValue />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Just Stars</h3>
                  <StarRating rating={5} readonly size="md" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UnifiedRatingsDemo />
    </QueryClientProvider>
  );
}