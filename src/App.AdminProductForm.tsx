import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPage from './components/AdminPage';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('admin');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <AdminPage setCurrentPage={setCurrentPage} />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;