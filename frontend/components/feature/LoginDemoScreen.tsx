'use client';

import React from 'react';
import { Baby, Send } from 'lucide-react';
import { MOCK_USERS } from '../../modules/shared/data/mockData';
import { useAppContext } from '../../modules/shared/context/AppContext';

export function LoginDemoScreen() {
  const { login } = useAppContext();

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Baby className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">KinderConnect</h1>
          <p className="text-gray-500">Bridging the gap between home and school.</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Select a Demo Role</span>
            </div>
          </div>

          <div className="grid gap-3">
            {MOCK_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => login(u, 'demo-token')}
                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <span className="text-2xl w-10 h-10 rounded-full mr-4 group-hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                  {u.avatar?.startsWith('data:') ? (
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    u.avatar
                  )}
                </span>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{u.role}</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 text-indigo-600">
                  <Send size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
