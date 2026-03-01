import React from 'react';
import { AlertTriangle, Settings, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface ConfigurationStatusProps {
  children: React.ReactNode;
}

export default function ConfigurationStatus({ children }: ConfigurationStatusProps) {
  // If Supabase is properly configured, render children normally
  if (isSupabaseConfigured) {
    return <>{children}</>;
  }

  // If not configured, show configuration notice
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Configuration Notice Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <strong>Configuration Required:</strong> Supabase environment variables are missing. 
              Some features may not work properly.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Setup Required</h1>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              To use all features of this application, you need to configure Supabase environment variables.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Environment Variables:</h3>
            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <code className="text-sm">
                VITE_SUPABASE_URL=your_supabase_project_url<br/>
                VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
              </code>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">How to get these values:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
              <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">Supabase Dashboard <ExternalLink className="h-3 w-3 ml-1" /></a></li>
              <li>Select your project or create a new one</li>
              <li>Go to Settings → API</li>
              <li>Copy the "Project URL" and "anon public" key</li>
              <li>Add them to your .env file in the project root</li>
            </ol>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> The application will continue to work in demo mode, but database features 
                (authentication, reviews, cart, etc.) will not be functional.
              </p>
            </div>
          </div>
        </div>
        
        {/* Render the app content anyway for demo purposes */}
        <div className="opacity-75">
          {children}
        </div>
      </div>
    </div>
  );
}