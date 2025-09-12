import React from 'react';
import { Truck, Shield, Route } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg border-b-2 border-royal-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-royal-600 to-royal-700 rounded-xl shadow-lg transition-transform duration-200 hover:scale-105">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-royal-700 to-royal-900 bg-clip-text text-transparent">
                  Trip & ELD Planner
                </h1>
                <p className="text-xs text-royal-500 font-medium">
                  Professional Route Planning & Compliance
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4 text-sm text-royal-600">
              <div className="flex items-center space-x-2">
                <Route className="h-4 w-4" />
                <span>Route Optimization</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>DOT Compliance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};