import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import FeaturedProducts from './components/FeaturedProducts';
import Testimonials from './components/Testimonials';
import ProductDetail from './components/ProductDetail';
import UpdateProfile from './components/UpdateProfile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [selectedProductId, setSelectedProductId] = React.useState<number | null>(1);

  const mockAddToCart = (product: any) => {
    console.log('Added to cart:', product);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'featured':
        return (
          <FeaturedProducts 
            setCurrentPage={setCurrentPage}
            setSelectedProductId={setSelectedProductId}
            addToCart={mockAddToCart}
          />
        );
      case 'testimonials':
        return <Testimonials />;
      case 'product-detail':
        return (
          <ProductDetail 
            productId={selectedProductId}
            setCurrentPage={setCurrentPage}
            addToCart={mockAddToCart}
          />
        );
      case 'update-profile':
        return <UpdateProfile setCurrentPage={setCurrentPage} />;
      default:
        return (
          <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Fixed Components Demo
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <button
                  onClick={() => setCurrentPage('featured')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Featured Products
                </button>
                <button
                  onClick={() => setCurrentPage('testimonials')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Testimonials
                </button>
                <button
                  onClick={() => setCurrentPage('product-detail')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Product Detail
                </button>
                <button
                  onClick={() => setCurrentPage('update-profile')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Update Profile
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Issues Fixed:</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Fixed missing Radix UI Toast import</li>
                  <li>Removed dependency on class-variance-authority</li>
                  <li>Added proper CSS animations for toast components</li>
                  <li>Fixed component export/import issues</li>
                  <li>Updated toast component to use proper Radix UI structure</li>
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        {renderContent()}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;