import React from 'react';
import { ArrowRight, Search, FileText, FileSearch, Scale, Book } from 'lucide-react';
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import Returnpage from '@/components/returnpage';
import Link from 'next/link';
interface MenuItem {
  label: string;
  route: string;
  desc :string;
}

const getIcon = (label: string) => {
  switch (label) {
    case 'BNS Search':
      return <Search className="w-6 h-6" />;
    case 'Headnote Generator':
      return <FileText className="w-6 h-6" />;
    case 'Summarizer':
      return <FileSearch className="w-6 h-6" />;
    case 'Legal Assistant':
      return <Scale className="w-6 h-6" />;
    case 'Lex Citation':
      return <Book className="w-6 h-6" />;
    default:
      return null;
  }
};

const MenuPage = () => {
  const menuItems: MenuItem[] = [
    { label: "BNS Search", desc:'The Bharatiya Nyaya Sanhita (BNS) Search is a distinct numerical number used to refer to certain legal provisions and offences stipulated by the official criminal code of India.', route: "/bns-search" },
    { label: "Headnote Generator", desc:'Legal Head Note Creator is an innovative tool that expedites the process of summarising legal cases.', route: "/headnote-generation" },
    { label: "Summarizer", desc:'Use the Lex Summarizer to condense documents, contracts, and agreements down to the key points instantly.', route: "/summarizer" },
    { label: "Legal Assistant", desc:'Enabling Legal Practitioners with Document Query: Your AI-Powered Lex Genie Document Analysis Companion.', route: "/legal-assistant" },
    { label: "Lex Citation", desc:'Lex Citation is a powerful AI-powered tool that simplifies the process of citing legal sources.', route: "/lex-citation" }
  ];

  return (
    <DefaultLayout>
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Returnpage />
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center"> Civil Law</h1>
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div 
              key={item.route}
              className="group bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <Link href={item.route} className="block p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    {getIcon(item.label)}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.label}</h2>
                <p className="text-gray-600">{item.desc}</p>
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