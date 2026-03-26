import { useState, useEffect, useCallback } from 'react';
import { User } from '../modules/shared/types';
import { AuthApi, UserApi } from '../lib/api-client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    AuthApi.me()
      .then((userData) => {
        setUser(userData);
        setToken('cookie');
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const login = useCallback((userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken || 'cookie');
    if (typeof window !== 'undefined') {
      localStorage.setItem('kinderconnect_token', authToken);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthApi.logout();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kinderconnect_token');
    }
  }, []);

  const updateUserProfile = useCallback(async (id: string, payload: { name: string; phone: string; password?: string; avatar?: string }) => {
    const updated = await UserApi.updateProfile(id, payload);
    setUser(updated);
    return updated; // Return updated user for potential further syncing
  }, []);

  return {
    user,
    setUser,
    token,
    authLoading,
    setAuthLoading,
    login,
    logout,
    updateUserProfile,
  };
}
