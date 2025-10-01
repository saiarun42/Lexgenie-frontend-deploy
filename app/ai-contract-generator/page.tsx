"use client"
import React from 'react';
import { 
  FileText, 
  ScrollText,
  FileCheck,
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Link from 'next/link';
import { useRouter } from "next/navigation";

interface MenuItem {
  label: string;
  route: string;
  description: string;
  icon: React.ReactNode;
}

const MenuPage = () => {
const router = useRouter();
  const menuItems: MenuItem[] = [  
    {
      label: "Contract Generator",
      route: "/contract-generator",
      description: "Create customized contracts",
      icon: <FileText className="w-6 h-6" />
    },
    {
      label: "Review Contract",
      route: "/review-contract",
      description: "Get comprehensive contract reviews",
      icon: <FileCheck className="w-6 h-6" />
    },
    {
      label: "Recommend Clause",
      route: "/recommend-clause",
      description: "Get AI-powered clause recommendations",
      icon: <ScrollText className="w-6 h-6" />
    },
    {
      label: "Identify Risk",
      route: "/identify-risk",
      description: "Identify potential contract risks",
      icon: <AlertCircle className="w-6 h-6" />
    },
   
  ];

  return (
    <DefaultLayout>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 mr-2" />
              <span>Back</span>
            </button>
          
          </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Ai Contract Generator</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div 
              key={item.route}
              className="group bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <Link href={item.route} className="block p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    {item.icon}
                  </div>
                  <div className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all" />

                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.label}</h2>
                <p className="text-gray-600">{item.description}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
    </DefaultLayout>
  );
};

export default MenuPage;