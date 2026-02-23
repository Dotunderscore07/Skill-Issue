'use client';

import { LoginScreen } from '../components/feature/LoginScreen';
import { AuthenticatedLayout } from '../components/feature/AuthenticatedLayout';
import { useAppContext } from '../modules/shared/context/AppContext';

export default function Home() {
  const { user } = useAppContext();
  return user ? <AuthenticatedLayout /> : <LoginScreen />;
}
