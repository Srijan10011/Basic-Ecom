import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPage from './components/AdminPage';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
  },
});

function App() {
  const setCurrentPage = (page: string) => {
    console.log('Navigate to:', page);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-cream">
        <AdminPage setCurrentPage={setCurrentPage} />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;