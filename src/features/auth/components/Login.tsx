import React, { useState } from 'react';
import { X } from 'lucide-react';
import { signIn } from '../services/authService';
interface LoginProps {
  setModal: (modal: 'login' | 'signup' | null) => void;
}

export default function Login({ setModal }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setMessageType(null);

    
    try {
      await signIn(email, password);
      setMessage('Login successful!');
      window.location.reload();
    } catch (error: any) {
    
      setMessage(error.message);
      setMessageType('error');
    } 
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button onClick={() => setModal(null)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Your Password"
              required
            />
            <div className="text-right mt-2">
              <a href="#" className="text-sm text-green-600 hover:underline">Forgot Password?</a>
            </div>
          </div>
          {message && (
            <p className={`text-center text-sm mb-4 ${messageType === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <button onClick={() => setModal('signup')} className="text-green-600 hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
