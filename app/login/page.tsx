"use client"
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

const LoginContent = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black/10">
      {/* Background Image */}
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
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black/10">
          <div className="w-full max-w-md p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-white/20 rounded-lg"></div>
              <div className="space-y-3">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-10 bg-white/20 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-10 bg-white/20 rounded"></div>
              </div>
              <div className="h-10 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;