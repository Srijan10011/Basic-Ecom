import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface UpdateProfileProps {
  setCurrentPage: (page: string) => void;
}

export default function UpdateProfile({ setCurrentPage }: UpdateProfileProps) {
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<'name' | 'password' | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ first_name: firstName, last_name: lastName })
        .eq('id', user.id);

      if (error) {
        alert('Error updating name: ' + error.message);
      } else {
        alert('Name updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        setCurrentPage('profile');
      }
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: oldPassword,
      });

      if (signInError) {
        alert('Invalid old password.');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      setLoading(false);

      if (updateError) {
        alert('Error updating password: ' + updateError.message);
      } else {
        alert('Password updated successfully!');
        setCurrentPage('profile');
      }
    }
  };

  const renderSelection = () => {
    if (selection === 'name') {
      return (
        <div>
          <h2 className="text-xl font-semibold text-center mb-4">Change Name</h2>
          <div className="flex space-x-4">
            <div className="space-y-2 w-1/2">
              <label
                htmlFor="first-name"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2 w-1/2">
              <label
                htmlFor="last-name"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Enter your last name"
              />
            </div>
          </div>
        </div>
      );
    }
    if (selection === 'password') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="old-password"
              className="block text-sm font-medium text-gray-700"
            >
              Old Password
            </label>
            <input
              type="password"
              id="old-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Enter your old password"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Enter your new password"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Repeat your new password"
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Update Profile</h1>
            <p className="text-gray-600">
              Choose an option to update.
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {!selection ? (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setSelection('name')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Change Name
                </button>
                <button
                  onClick={() => setSelection('password')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Change Password
                </button>
              </div>
            ) : (
              renderSelection()
            )}
          </div>

          <div className="text-center">
            <button
              onClick={() => selection ? setSelection(null) : setCurrentPage('profile')}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors mr-4"
            >
              {selection ? 'Back' : 'Cancel'}
            </button>
            {selection === 'name' && (
              <button
                onClick={handleNameChange}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Save Changes
              </button>
            )}
            {selection === 'password' && (
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
