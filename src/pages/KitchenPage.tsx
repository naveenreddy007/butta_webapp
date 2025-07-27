import React, { useState } from 'react';
import { ClipboardList, BarChart3 } from 'lucide-react';
import ErrorBoundary from '../components/kitchen/ErrorBoundary';
import KitchenDashboard from '../components/kitchen/KitchenDashboard';
import KitchenNavigation from '../components/kitchen/KitchenNavigation';
import CookingBoard from '../components/kitchen/CookingBoard';
import StockManagement from '../components/kitchen/StockManagement';

interface KitchenPageProps {
  onNavigateBack: () => void;
  businessInfo: {
    name: string;
    logo?: string;
    contact?: any;
    branding?: {
      primaryColor: string;
      secondaryColor: string;
    };
  };
}

const KitchenPage: React.FC<KitchenPageProps> = ({ onNavigateBack, businessInfo }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <KitchenDashboard />;
      case 'cooking':
        return <CookingBoard />;
      case 'stock':
        return <StockManagement />;
      case 'indents':
        return (
          <div className="p-6 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Indents Management</h3>
            <p className="text-gray-600">Coming soon! Manage food requirements and indents.</p>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports & Analytics</h3>
            <p className="text-gray-600">Coming soon! View kitchen performance reports and analytics.</p>
          </div>
        );
      default:
        return <KitchenDashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Kitchen Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={onNavigateBack}
                  className="text-gray-600 hover:text-gray-900 mr-4 transition-colors"
                >
                  ← Back to Home
                </button>
                <h1 className="text-xl font-semibold text-gray-900">
                  {businessInfo.name} - Kitchen Management
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Kitchen Navigation */}
        <KitchenNavigation 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
        
        {/* Kitchen Content */}
        <div className="bg-gray-50">
          <ErrorBoundary>
            {renderCurrentPage()}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default KitchenPage;