"use client";
import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/header";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* <!-- ===== Header Start ===== --> */}
      <Header />
      {/* <!-- ===== Header End ===== --> */}

      <div className="flex flex-1 overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 2xl:p-10">
          
          {children}
          
        </div>
        
        
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
    </div>
  );
}
