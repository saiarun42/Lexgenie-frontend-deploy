'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

const LoginContent = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black/10">
      <div
        className="absolute inset-0 bg-no-repeat bg-center opacity-10"
        style={{
          backgroundImage: "url('/pngegg.png')",
          backgroundSize: 'contain',
        }}
      />
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;
