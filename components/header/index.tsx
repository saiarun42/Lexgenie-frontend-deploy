'use client';

import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, Notebook } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.user.email.split('@')[0]); // Use email username as display name
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Close dropdown and redirect to landing page
        setIsOpen(false);
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo Section - Hidden on mobile */}
          <div className="hidden md:block">
            <Link href='/dashboard'>
              <Image
                src="/logo_lex.png"
                alt="Lex Genie"
                width={150}
                height={100}
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Profile Section */}
          <div className="relative ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg"
            >
              <div className="flex flex-col items-end">
                <span className="font-medium text-gray-900">{userName || 'User'}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                <Image
                  src="/user-01.png"
                  alt="Profile"
                  width={150}
                  height={100}
                  className="h-full w-full object-cover"
                />
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="z-10 absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
                <Link href="/profile" className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">My Profile</span>
                </Link>
                <button className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50">
                  <Notebook className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">My Contacts</span>
                </button>
                <button className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Account Settings</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50 text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;