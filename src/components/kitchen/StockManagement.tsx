import React, { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle, Search, Filter } from 'lucide-react';
import KitchenService, { type StockItem } from '../../services/kitchenService';

const StockManagement: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const categories = ['all', 'Grains', 'Meat', 'Dairy', 'Vegetables', 'Spices', 'Oil & Condiments'];

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    try {
      const alerts = await KitchenService.getStockAlerts();
      setLowStockItems(alerts.lowStock);
      
      // Mock all stock items
      const allStock: StockItem[] = [
        ...alerts.lowStock,
        {
          id: '4',
          itemName: 'Tomatoes',
          category: 'Vegetables',
          quantity: 20,
          unit: 'kg',
          minStock: 8
        },
        {
          id: '5',
          itemName: 'Cooking Oil',
          category: 'Oil & Condiments',
          quantity: 15,
          unit: 'liters',
          minStock: 5
        },
        {
          id: '6',
          itemName: 'Turmeric Powder',
          category: 'Spices',
          quantity: 2,
          unit: 'kg',
          minStock: 1
        }
      ];
      
      setStockItems(allStock);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (item: StockItem) => {
    if (item.minStock && item.quantity <= item.minStock) {
      return { status: 'low', color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (item.minStock && item.quantity <= item.minStock * 1.5) {
      return { status: 'medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    }
    return { status: 'good', color: 'text-green-600 bg-green-50 border-green-200' };
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Stock</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadStockData}
            className="px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-100"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="w-6 h-6 mr-2" />
            Stock Management
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage kitchen inventory
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Low Stock Alert</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map((item) => (
              <div key={item.id} className="bg-white border border-red-200 rounded p-3">
                <h4 className="font-semibold text-gray-900">{item.itemName}</h4>
                <p className="text-sm text-gray-600">{item.category}</p>
                <p className="text-sm text-red-600 font-medium">
                  Only {item.quantity} {item.unit} left
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search stock items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item);
          return (
            <div key={item.id} className={`border rounded-lg p-4 ${stockStatus.color}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.itemName}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stockStatus.status === 'low' ? 'bg-red-100 text-red-800' :
                  stockStatus.status === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {stockStatus.status === 'low' ? 'Low Stock' :
                   stockStatus.status === 'medium' ? 'Medium' : 'Good'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Stock:</span>
                  <span className="font-medium">{item.quantity} {item.unit}</span>
                </div>
                {item.minStock && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Min Stock:</span>
                    <span className="text-sm">{item.minStock} {item.unit}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => alert(`Update stock for ${item.itemName}`)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Update
                </button>
                <button
                  onClick={() => alert(`View history for ${item.itemName}`)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  History
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No stock items found matching your criteria</p>
        </div>
      )}

      {/* Add Stock Modal (Simple) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Stock Item</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item Name"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                <option value="">Select Category</option>
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Quantity"
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="number"
                placeholder="Minimum Stock Level"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Stock item added successfully!');
                  setShowAddForm(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;