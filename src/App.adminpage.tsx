import React from 'react';
import AdminPage from './components/AdminPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';

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

function App() {
  const setCurrentPage = (page: string) => {
    console.log('Navigate to:', page);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-cream">
        <AdminPage setCurrentPage={setCurrentPage} />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;