'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WelcomePage from '@/components/Dashboard/lexlaw';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Important for cookies
        });

        if (!response.ok) {
          // If not authenticated, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <DefaultLayout>
      <WelcomePage />
    </DefaultLayout>
  );
} 