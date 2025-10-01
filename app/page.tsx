'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Scale, Shield, FileText, ArrowRight, Check } from 'lucide-react';

// Define interfaces for component props
interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureCardProps {
  title: string;
  description: string;
}

// Main component
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/logo_lex.png"
                  alt="LexGenie"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-black px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-16 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/grid-pattern-background-minimal-black-white-simple-design-vector_53876-154196.jpg?semt=ais_hybrid')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5"></div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 tracking-tight">
              Transform Your Legal Practice with AI
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the future of legal work with our advanced AI-powered solutions for document analysis, contract generation, and legal research.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all transform hover:scale-105 shadow-lg hover:shadow-gray-900/25"
              >
                Start Free Trial
              </Link>
              <Link
                href="/demo"
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"
              >
                Watch Demo
              </Link>
            </div>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-gray-900" /> No credit card required
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-gray-900" /> 14-day free trial
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-gray-900" /> Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
              Comprehensive Legal Solutions
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our AI-powered platform provides cutting-edge tools for legal professionals, 
              streamlining your workflow and enhancing productivity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Scale className="w-10 h-10" />}
              title="Civil Law"
              description="Automate document analysis, risk assessment, and contract generation for civil law cases with our advanced AI technology."
            />
            <ServiceCard
              icon={<Shield className="w-10 h-10" />}
              title="Corporate Law"
              description="Streamline corporate document management, due diligence, and compliance with intelligent automation tools."
            />
            <ServiceCard
              icon={<FileText className="w-10 h-10" />}
              title="Contract Analysis"
              description="Leverage AI to analyze contracts, identify risks, and ensure compliance with automated review processes."
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
              Why Do Legal Professionals Choose LexGenie?
            </h2>
            <p className="text-lg text-gray-600">
              Experience the benefits of AI-powered legal solutions designed for modern practice
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Advanced AI Analysis"
              description="State-of-the-art machine learning algorithms provide accurate and reliable document analysis"
            />
            <FeatureCard
              title="80% Time Savings"
              description="Dramatically reduce time spent on document review and contract analysis"
            />
            <FeatureCard
              title="Enterprise Security"
              description="Protect your sensitive data with military-grade encryption and robust security measures, ensuring maximum safety and compliance."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-8 text-white">
            Ready to Revolutionize Your Legal Practice?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join legal professionals who trust LexGenie to streamline their work
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-200 text-black py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/">
                <Image
                  src="/logo_lex.png"
                  alt="LexGenie"
                  width={120}
                  height={40}
                  className="h-8 w-auto mb-6"
                  priority
                />
              </Link>
              <p className="text-gray-800 text-sm">
                AI-powered legal solutions for the modern practice of law
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-800 text-sm">
                <li><Link href="#" className="hover:text-gray-600 transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-800 text-sm">
                <li><Link href="#" className="hover:text-gray-600 transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-gray-800 text-sm">
                <li><Link href="#" className="hover:text-gray-600 transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-8 mt-8 text-center text-sm text-gray-800">
            <p>&copy; {new Date().getFullYear()} LexGenie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component definitions with TypeScript interfaces
const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
    <div className="text-gray-900 mb-6 bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center">{icon}</div>
    <h3 className="text-xl font-bold mb-4 text-gray-900">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description }) => (
  <div className="bg-gray-50 p-8 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100">
    <h3 className="text-xl font-bold mb-4 text-gray-900">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
