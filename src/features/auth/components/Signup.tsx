import React, { useState } from 'react';
import { X } from 'lucide-react';
import { signUp, createProfile } from '../services/authService';

interface SignupProps {
  setModal: (modal: 'login' | 'signup' | null) => void;
}

export default function Signup({ setModal }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setMessageType(null);

    if (password !== repeatPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const { user } = await signUp(email, password, firstName, lastName);

      if (!user) {
        setMessage('Sign up successful! Please check your email to confirm your account.');
        setMessageType('success');
        setEmail('');
        setPassword('');
        setRepeatPassword('');
        setFirstName('');
        setLastName('');
      } else {
        await createProfile(user.id, firstName, lastName, email);
        setModal(null);
        window.location.reload();
      }
    } catch (error: any) {
      setMessage(error.message);
      setMessageType('error');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={() => setModal(null)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create an Account</h2>
        <form onSubmit={handleSignup}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-6">
              <label htmlFor="first-name" className="block text-gray-700 font-medium mb-2">First Name</label>
              <input
                type="text"
                id="first-name"
                name="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Your First Name"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="last-name" className="block text-gray-700 font-medium mb-2">Last Name</label>
              <input
                type="text"
                id="last-name"
                name="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Your Last Name"
                required
              />
            </div>
            <div className="mb-6 md:col-span-2">
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
                placeholder="Create a Password"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="repeat-password" className="block text-gray-700 font-medium mb-2">Repeat Password</label>
              <input
                type="password"
                id="repeat-password"
                name="repeat-password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Repeat Password"
                required
              />
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
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Already a user?{' '}
          <button onClick={() => setModal('login')} className="text-green-600 hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
