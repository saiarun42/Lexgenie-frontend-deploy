'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Scale } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  callbackUrl: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ callbackUrl }) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Login failed');

      setError('Login successful!');
      setTimeout(() => router.replace(callbackUrl), 800); // short delay for UX
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md p-8 rounded-lg backdrop-blur-sm bg-white/20 shadow-xl border border-white/30">
      <div className="text-center space-y-2 mb-8">
        <div className="flex justify-center">
          <Scale className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-bold">LexGenie</h1>
        <p className="text-gray-700">Civil and Corporate Law Solutions</p>
      </div>

      {error && (
        <div
          className={`mb-4 p-3 rounded-md text-center ${
            error.includes('successful')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-white/10 border border-white/30 rounded-md placeholder-gray-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 bg-white/10 border border-white/30 rounded-md placeholder-gray-300 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-300" />
              ) : (
                <Eye className="h-5 w-5 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded-md text-sm font-medium text-black bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium hover:text-gray-200">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
