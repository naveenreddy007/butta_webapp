import React from 'react';
import { Home, ChefHat, Package, ClipboardList, BarChart3 } from 'lucide-react';

interface KitchenNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const KitchenNavigation: React.FC<KitchenNavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'cooking', label: 'Cooking Board', icon: ChefHat },
    { id: 'stock', label: 'Stock Management', icon: Package },
    { id: 'indents', label: 'Indents', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default KitchenNavigation;