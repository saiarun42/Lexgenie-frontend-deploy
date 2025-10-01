"use client";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

const ReturnPage = () => { // 
  const router = useRouter(); 

  return (
    <div>
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center z-20 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 mr-2 " />
          <span>Back</span>
        </button>
      </div>
    </div>
  );
};

export default ReturnPage; // 
