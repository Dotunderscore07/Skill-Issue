'use client';

import React, { useState } from 'react';
import { Baby, LogIn, UserPlus } from 'lucide-react';
import { useAppContext } from '../../modules/shared/context/AppContext';
import { useAlert } from '../../modules/shared/context/AlertContext';

export function LoginScreen({ onToggleRegister }: { onToggleRegister: () => void }) {
  const { login } = useAppContext();
  const { showToast } = useAlert();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        showToast('Login successful!', 'success');
        login(data.data.user, data.data.token);
      } else {
        showToast(data.error || 'Login failed', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Baby className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">KinderConnect</h1>
          <p className="text-gray-500">Welcome Back!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your password"
            />
          </div>
          <button 
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </button>
        </form>

        <div className="text-center">
          <button onClick={onToggleRegister} className="text-sm text-indigo-600 hover:text-indigo-500">
            Don't have an account? Register here.
          </button>
        </div>
      </div>
    </div>
  );
}
