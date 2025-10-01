'use client';

import React, { useState, } from 'react';
import { Eye, EyeOff, Mail, Lock, Scale } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      // For static auth, we'll show success if the credentials match our static values
      const staticEmail = 'steve@iicl.in';
      const staticPassword = '12345';
      
      if (email !== staticEmail || password !== staticPassword) {
        throw new Error('Invalid credentials. Use steve@iicl.in / 12345 for testing.');
      }

      // Call the login API (which is also using static auth)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect to callback URL on successful login
      router.push(callbackUrl);
      router.refresh(); // Refresh to update auth state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md p-8 rounded-lg backdrop-blur-sm bg-white/20 shadow-xl border border-white/30">
      {/* Logo and title section */}
      <div className="text-center space-y-2 mb-8">
        <div className="flex justify-center">
          <Scale className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-bold">LexGenie</h1>
        <p className="text-gray-700">Civil and Corporate Law Solutions</p>
      </div>

      {/* Error message */}
      {error && (
        <div className={`mb-4 p-3 rounded-md text-center ${
          error.includes('successful') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {error}
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email field */}
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
              className="block w-full pl-10 pr-3 py-2 bg-white/10 border border-white/30 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent
                        placeholder-gray-300 backdrop-blur-sm"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {/* Password field */}
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
              className="block w-full pl-10 pr-10 py-2 bg-white/10 border border-white/30 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent
                        placeholder-gray-300 backdrop-blur-lg"
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

        {/* Remember me and Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 bg-white/10 border-white/30 rounded focus:ring-2 focus:ring-white/50"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a href="#" className="font-medium hover:text-gray-200">
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                   text-sm font-medium text-black bg-gray-100 hover:bg-gray-200 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Sign up link */}
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