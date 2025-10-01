"use client"
import React from 'react';
import {
    FileText,
    FileSignature,
    Search,
    Files,
    ArrowRight
} from 'lucide-react';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Link from 'next/link';
import Returnpage from '@/components/returnpage';
interface MenuItem {
    label: string;
    route: string;
    description: string;
    icon: React.ReactNode;
}

const MenuPage = () => {
    const menuItems: MenuItem[] = [
        {
            label: "AI Contract Navigator",
            route: "/ai-contract-generator",
            description: "Navigate through AI-powered contract tools",
            icon: <FileSignature className="w-6 h-6" />
        },
        {
            label: "Legal Lens",
            route: "/legal-lens",
            description: "Analyze legal documents with precision",
            icon: <Search className="w-6 h-6" />
        },
        {
            label: "Summarise Contract",
            route: "/summarise-contract",
            description: "Get quick contract summaries",
            icon: <FileText className="w-6 h-6" />
        },
        {
            label: "Compare Contract",
            route: "/compare-contract",
            description: "Compare multiple contracts side by side",
            icon: <Files className="w-6 h-6" />
        },
    ];

    return (
        <DefaultLayout>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <Returnpage />
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Corporate Law Tools</h1>
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