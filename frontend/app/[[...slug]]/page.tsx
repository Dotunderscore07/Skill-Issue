'use client';

import { useState } from 'react';
import { LoginScreen } from '../../components/feature/LoginScreen';
import { RegisterScreen } from '../../components/feature/RegisterScreen';
import { AuthenticatedLayout } from '../../components/feature/AuthenticatedLayout';
import { useAppContext } from '../../modules/shared/context/AppContext';

export default function CatchAllPage() {
  const { user, authLoading } = useAppContext();
  const [isRegistering, setIsRegistering] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium animate-pulse">Verifying Session...</div>
      </div>
    );
  }

  if (user) {
    return <AuthenticatedLayout />;
  }

  return isRegistering ? (
    <RegisterScreen onToggleLogin={() => setIsRegistering(false)} />
  ) : (
    <LoginScreen onToggleRegister={() => setIsRegistering(true)} />
  );
}
