import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for required environment variables
const hasValidConfig = supabaseUrl && supabaseAnonKey;

if (!hasValidConfig) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.error('Current values:', {
    VITE_SUPABASE_URL: supabaseUrl ? '[SET]' : '[MISSING]',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '[SET]' : '[MISSING]'
  });
}

// Create a mock client for development when env vars are missing
const createMockClient = () => {
  const mockClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      refreshSession: () => Promise.resolve({ data: null, error: null })
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          limit: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } })
        }),
        in: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
        order: () => ({ 
          limit: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } })
        }),
        limit: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } })
      }),
      insert: () => ({ 
        select: () => ({ 
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
        })
      }),
      update: () => ({ 
        eq: () => ({ 
          select: () => ({ 
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          })
        })
      }),
      delete: () => ({ 
        eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      }),
      upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }),
    rpc: (functionName: string, params?: any) => {
      console.warn(`RPC call to ${functionName} blocked: Supabase not configured`);
      if (functionName === 'get_product_reviews') {
        return Promise.resolve({ data: [], error: null });
      }
      return Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
    }
  };
  return mockClient as any;
};

// Create the Supabase client or mock client
export const supabase: SupabaseClient = hasValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'bolt-auth-token',
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'bolt-web-app'
        }
      }
    })
  : createMockClient();

// Export configuration status
export const isSupabaseConfigured = hasValidConfig;

// Add connection health check using a simple query
export const checkConnection = async () => {
  try {
    if (!isSupabaseConfigured) {
      return { 
        isConnected: false, 
        error: { message: 'Supabase not configured. Please check environment variables.' }
      };
    }
    
    // Use a simple query to check database connectivity
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return { isConnected: !error, error };
  } catch (err) {
    return { isConnected: false, error: err };
  }
};

// Retry mechanism for database operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};