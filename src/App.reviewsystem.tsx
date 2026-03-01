import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import FeaturedProducts from './components/FeaturedProducts';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import Shop from './components/Shop';
import Contact from './components/Contact';
import Login from './components/Login';
import Signup from './components/Signup';
import TrackOrder from './components/TrackOrder';
import ProductDetail from './components/ProductDetail';
import Profile from './components/Profile';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminPage from './components/AdminPage';
import ConfigurationStatus from './components/ConfigurationStatus';
import { useVisibilityRefetch } from './lib/utils';

import { supabase, checkConnection } from './lib/supabaseClient';
import {
  fetchUserCart,
  addItemToUserCart,
  setItemQuantityInUserCart,
  removeItemFromUserCart,
  clearUserCart,
  loadGuestCart,
  saveGuestCart,
  clearGuestCart
} from './lib/cart';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import GuestOrderAccess from './components/GuestOrderAccess';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
  },
});
// Make queryClient available globally for cache invalidation
(window as any).queryClient = queryClient;

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [modal, setModal] = useState<'login' | 'signup' | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const refetchCart = async () => {
    if (session?.user) {
      const items = await fetchUserCart(session.user.id);
      setCart(items);
    } else {
      setCart(loadGuestCart());
    }
  };

  const addToCart = async (product: any) => {
    if (session?.user) {
      await addItemToUserCart(session.user.id, product.id, 1);
      await refetchCart();
    } else {
      const items = [...cart];
      const found = items.find(i => i.id === product.id);
      if (found) {
        found.quantity += 1;
      } else {
        items.push({ ...product, quantity: 1 });
      }
      saveGuestCart(items);
      setCart(items);
    }
  };

  const updateCartQuantity = async (productId: number, quantity: number) => {
    if (session?.user) {
      await setItemQuantityInUserCart(session.user.id, productId, quantity);
      await refetchCart();
    } else {
      let items;
      if (quantity <= 0) {
        items = cart.filter(i => i.id !== productId);
      } else {
        items = cart.map(i => i.id === productId ? { ...i, quantity } : i);
      }
      saveGuestCart(items);
      setCart(items);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (session?.user) {
      await removeItemFromUserCart(session.user.id, productId);
      await refetchCart();
    } else {
      const items = cart.filter(item => item.id !== productId);
      saveGuestCart(items);
      setCart(items);
    }
  };

  const clearCart = async () => {
    if (session?.user) {
      await clearUserCart(session.user.id);
      await refetchCart();
    } else {
      clearGuestCart();
      setCart([]);
    }
  };

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
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user) {
        refetchCart(); // Refetch when tab becomes visible
      }
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session?.user]);

  
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        // Check database connection first
        await checkDatabaseConnection();

        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting initial session:', sessionError);
        } else if (mounted) {
          setSession(initialSession);
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (mounted) {
            setSession(session);
            // Whenever auth changes, refresh cart from appropriate source
            await refetchCart();
          }
        });

        if (mounted) {
          // Initial cart load
          await refetchCart();
          setIsLoading(false);
        }

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing app:', error);
        if (mounted) {
          setIsLoading(false);
          setConnectionError('Failed to initialize application. Please refresh the page.');
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, []);

  // Retry connection when user clicks retry
  const handleRetryConnection = async () => {
    setIsLoading(true);
    setConnectionError(null);
    await checkDatabaseConnection();
    setIsLoading(false);
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
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Retry Connection
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
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <About setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'shop':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Shop setCurrentPage={setCurrentPage} setSelectedProductId={setSelectedProductId} addToCart={addToCart} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'contact':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Contact />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'track-order':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <TrackOrder />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'product-detail':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <ProductDetail productId={selectedProductId} setCurrentPage={setCurrentPage} addToCart={addToCart} session={session} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'profile':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Profile session={session} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'cart':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Cart cart={cart} setCurrentPage={setCurrentPage} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'checkout':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Checkout cart={cart} setCurrentPage={setCurrentPage} session={session} clearCart={clearCart} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'admin':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <AdminPage setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'guestOrder':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <GuestOrderAccess setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'home':
      default:
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Hero setCurrentPage={setCurrentPage} setModal={setModal} session={session} />
            <Features />
            <FeaturedProducts setCurrentPage={setCurrentPage} setSelectedProductId={setSelectedProductId} addToCart={addToCart} />
            <Testimonials />
            <Newsletter />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigurationStatus>
        <div className="min-h-screen">
          {renderPage()}
          {modal === 'login' && <Login setModal={setModal} />}
          {modal === 'signup' && <Signup setModal={setModal} />}
        </div>
        <Toaster />
      </ConfigurationStatus>
    </QueryClientProvider>
  );
}

export default App;