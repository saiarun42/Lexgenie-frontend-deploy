

"use client"
import React, { JSX, } from 'react';
import Link from 'next/link';

interface PracticeArea {
  icon: JSX.Element;
  label: string;
  route: string;
}

const practiceAreas: PracticeArea[] = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-full h-full"><path d="M32 4L4 16v8h56v-8L32 4zm-12 28h-8v24h8V32zm16 0h-8v24h8V32zm16 0h-8v24h8V32zM4 60h56v-4H4v4z" fill="currentColor" /></svg>,
    label: "Civil Law",
    route: "/civil-menu-page",
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-full h-full"><path d="M60 20H48v-8c0-2.2-1.8-4-4-4H20c-2.2 0-4 1.8-4 4v8H4c-2.2 0-4 1.8-4 4v32c0 2.2 1.8 4 4 4h56c2.2 0 4-1.8 4-4V24c0-2.2-1.8-4-4-4zM20 12h24v8H20v-8zm32 40H12V28h40v24z" fill="currentColor" /></svg>,
    label: "Corporate Law",
    route: "/corporate-menu-page",
  }
];

const WelcomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <section id="services" className="relative py-24 bg-white">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-no-repeat bg-center opacity-10"
          style={{
            backgroundImage: "url('/pngegg.png')",
            backgroundSize: 'contain',
          }}
        ></div>
        {/* Content Section */}
        <div className="relative container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Smart AI Legal Solutions </h2>
            <p className="text-gray-600">AI-powered platform to assist Law Professionals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {practiceAreas.map((area, index) => (
              <Link key={index} href={area.route} className="hover:underline">
                <div key={index} className="bg-white/30 backdrop-blur-sm p-8 rounded-xl border-2 border-gray-300  hover:border-black transition-all cursor-pointer relative text-center">
                  <div className="w-24 h-24 text-2xl mx-auto text-gray-700">
                    {area.icon}
                  </div>
                  <h3 className="text-xl font-semibold mt-5 ">{area.label}</h3>

                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg">
            &copy; 2025 LexGenie. All rights reserved.
            <span className="block mt-2 text-gray-400">Powered by IICL</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
