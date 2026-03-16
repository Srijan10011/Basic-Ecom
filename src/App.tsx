
import  { useState, useEffect } from 'react';
import Header from './shared/components/Header';
import Hero from './shared/components/Hero';
import Features from './shared/components/Features';
import FeaturedProducts from './features/products/components/FeaturedProducts';
import About from './shared/components/About';
import Testimonials from './shared/components/Testimonials';
import Newsletter from './shared/components/Newsletter';
import Footer from './shared/components/Footer';
import Shop from './features/products/components/Shop';
import Contact from './shared/components/Contact';
import Login from './features/auth/components/Login';
import Signup from './features/auth/components/Signup';
import TrackOrder from './features/orders/components/TrackOrder';
import ProductDetail from './features/products/components/ProductDetail';
import Profile from './shared/components/Profile';
import UpdateProfile from './shared/components/UpdateProfile';
import Cart from './features/cart/components/Cart';
import Checkout from './features/cart/components/Checkout';
import AdminPage from './features/admin/components/AdminPage';
import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from './features/theme/hooks/useTheme';
import { useAuth } from './features/auth/hooks/useAuth';
import { useCart } from './features/cart/hooks/useCart';
import { checkConnection } from './lib/supabaseClient';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './shared/components/ui/toaster';
import GuestOrderAccess from './features/orders/components/GuestOrderAccess';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});
// Make queryClient available globally for cache invalidation

function App() {
  // UI State
  const [currentPage, setCurrentPage] = useState('home');
  const [modal, setModal] = useState<'login' | 'signup' | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [resumeOrderId, setResumeOrderId] = useState<string | null>(null);
  const [trackOrderId, setTrackOrderId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  // Custom Hooks
  const { theme, toggleTheme } = useTheme();
  const { session, isLoading } = useAuth();
  const { cart, addToCart, updateCartQuantity, removeFromCart, clearCart, addingToCartId } = useCart(session);
  useEffect(() => {
    if (modal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [modal]);

  




   

  // Check database connection health
  const checkDatabaseConnection = async () => {
    try {
      const { isConnected, error } = await checkConnection();
      if (!isConnected) {
        console.error('Database connection failed:', error);
        setConnectionError('Unable to connect to database. Please check your connection and try again.');
      } else {
        setConnectionError(null);
      }
    } catch (err) {
      console.error('Connection check failed:', err);
      setConnectionError('Database connection error. Please refresh the page.');
    }
  };
  

  
  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  // Retry connection when user clicks retry
  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setConnectionError(null);
    await checkDatabaseConnection();
    setIsRetrying(false);
  };

  // Show loading or error state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show connection error
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{connectionError}</p>
          <button
  onClick={handleRetryConnection}
  disabled={isRetrying}
  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
>
  {isRetrying ? 'Retrying...' : 'Retry Connection'}
</button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
            <About setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'shop':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
            <Shop setCurrentPage={setCurrentPage} setSelectedProductId={setSelectedProductId} addToCart={addToCart} addingToCartId={addingToCartId} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'contact':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
            <Contact />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'track-order':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
<TrackOrder prefilledOrderId={trackOrderId} />            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'product-detail':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
            <ProductDetail productId={selectedProductId} setCurrentPage={setCurrentPage} addToCart={addToCart} session={session} addingToCartId={addingToCartId} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'profile':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
            <Profile
  session={session}
  setCurrentPage={setCurrentPage}
  setResumeOrderId={setResumeOrderId}
/>
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'update-profile':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
            <UpdateProfile setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'cart':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
            <Cart cart={cart} setCurrentPage={setCurrentPage} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'checkout':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
            <Checkout
  cart={cart}
  setCurrentPage={setCurrentPage}
  session={session}
  clearCart={clearCart}
  resumeOrderId={resumeOrderId}
  setResumeOrderId={setResumeOrderId}
  setTrackOrderId={setTrackOrderId}
/>
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'admin':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
            <AdminPage setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'guestOrder':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
            <GuestOrderAccess setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'home':
      default:
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} theme={theme} toggleTheme={toggleTheme} />
            <Hero setCurrentPage={setCurrentPage} setModal={setModal} session={session} />
            <Features />
            <FeaturedProducts setCurrentPage={setCurrentPage} setSelectedProductId={setSelectedProductId} addToCart={addToCart} addingToCartId={addingToCartId} />
            <Testimonials />
            <Newsletter />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        {renderPage()}
        {modal === 'login' && <Login setModal={setModal} />}
        {modal === 'signup' && <Signup setModal={setModal} />}
      </div>
      <Toaster />
      <SonnerToaster richColors />
    </QueryClientProvider>
  );
}

export default App;

