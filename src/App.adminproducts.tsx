import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPage from './components/AdminPage';
import { Toaster } from './components/ui/toaster';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('admin');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <AdminPage setCurrentPage={setCurrentPage} />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;