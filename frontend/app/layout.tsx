import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '../modules/shared/context/AppContext';
import { AlertProvider } from '../modules/shared/context/AlertContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KinderConnect',
  description: 'Bridging the gap between home and school.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AlertProvider>
          <AppProvider>{children}</AppProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
