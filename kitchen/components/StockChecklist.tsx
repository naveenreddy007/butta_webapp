'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Minus,
  Calendar,
  DollarSign,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Stock, AddStockForm, StockFilter } from '../types';
import { KitchenService } from '../services/kitchen.service';
import { supabase, realtimeUtils } from '../lib/supabase';

interface StockChecklistProps {
  userRole: string;
}

interface StockItemProps {
  item: Stock;
  onUpdate: (item: Stock) => void;
  canEdit: boolean;
}

const StockItem: React.FC<StockItemProps> = ({ item, onUpdate, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const isLowStock = item.minStock && item.quantity <= item.minStock;
  const isExpiringSoon = item.expiryDate && 
    new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const updateQuantity = async (newQuantity: number) => {
    if (!canEdit || newQuantity < 0) return;

    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('kitchen_stock')
        .update({ quantity: newQuantity })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;

      // Log the stock update
      await supabase
        .from('kitchen_stock_updates')
        .insert({
          stockId: item.id,
          type: newQuantity > item.quantity ? 'ADDED' : 'USED',
          quantity: Math.abs(newQuantity - item.quantity),
          reason: 'Manual adjustment',
          updatedBy: 'current-user-id' // TODO: Get actual user ID
        });

      onUpdate(data);
      setQuantity(newQuantity);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update stock:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatExpiryDate = (date: string) => {
    const expiryDate = new Date(date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    
    return expiryDate.toLocaleDateString('en-IN');
  };

  return (
    <Card className={`transition-all duration-200 ${
      isLowStock ? 'border-red-300 bg-red-50' : 
      isExpiringSoon ? 'border-yellow-300 bg-yellow-50' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{item.itemName}</h4>
            <p className="text-sm text-gray-600">{item.category}</p>
            {item.supplier && (
              <p className="text-xs text-gray-500">Supplier: {item.supplier}</p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-1">
            {isLowStock && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Low Stock
              </Badge>
            )}
            {isExpiringSoon && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Expiring Soon
              </Badge>
            )}
          </div>
        </div>

        {/* Quantity Display/Edit */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isEditing && canEdit ? (
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(0, quantity - 1))}
                  disabled={isUpdating}
                  className="h-8 w-8"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-20 h-8 text-center"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isUpdating}
                  className="h-8 w-8"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">{item.unit}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-semibold ${
                  isLowStock ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {item.quantity} {item.unit}
                </span>
                {item.minStock && (
                  <span className="text-sm text-gray-500">
                    (Min: {item.minStock} {item.unit})
                  </span>
                )}
              </div>
            )}
          </div>

          {canEdit && (
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => updateQuantity(quantity)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setQuantity(item.quantity);
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-sm text-gray-600">
          {item.expiryDate && (
            <div className="flex items-center justify-between">
              <span>Expiry:</span>
              <span className={isExpiringSoon ? 'text-yellow-700 font-medium' : ''}>
                {formatExpiryDate(item.expiryDate)}
              </span>
            </div>
          )}
          
          {item.costPerUnit && (
            <div className="flex items-center justify-between">
              <span>Cost per {item.unit}:</span>
              <span className="flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                ₹{item.costPerUnit}
              </span>
            </div>
          )}
          
          {item.batchNumber && (
            <div className="flex items-center justify-between">
              <span>Batch:</span>
              <span>{item.batchNumber}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AddStockModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (stock: Stock) => void;
}> = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState<AddStockForm>({
    itemName: '',
    category: '',
    quantity: 0,
    unit: 'kg',
    expiryDate: undefined,
    batchNumber: '',
    supplier: '',
    costPerUnit: 0,
    minStock: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Rice', 'Dal', 'Vegetables', 'Meat', 'Chicken', 'Fish',
    'Beverages', 'Desserts', 'Spices', 'Oil', 'Other'
  ];

  const units = ['kg', 'grams', 'liters', 'ml', 'pieces', 'packets', 'bunches'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName.trim() || !form.category || form.quantity <= 0) return;

    setIsSubmitting(true);
    try {
      const stock = await KitchenService.addStock(form);
      onAdd(stock);
      onClose();
      
      // Reset form
      setForm({
        itemName: '',
        category: '',
        quantity: 0,
        unit: 'kg',
        expiryDate: undefined,
        batchNumber: '',
        supplier: '',
        costPerUnit: 0,
        minStock: 0
      });
    } catch (error) {
      console.error('Failed to add stock:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add New Stock Item</CardTitle>
          <CardDescription>
            Add a new item to the kitchen inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  placeholder="e.g., Basmati Rice"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.quantity || ''}
                  onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit *</Label>
                <select
                  id="unit"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={form.expiryDate ? new Date(form.expiryDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setForm({ 
                    ...form, 
                    expiryDate: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="minStock">Minimum Stock Alert</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.minStock || ''}
                  onChange={(e) => setForm({ ...form, minStock: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={form.supplier || ''}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>

              <div>
                <Label htmlFor="costPerUnit">Cost per Unit (₹)</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPerUnit || ''}
                  onChange={(e) => setForm({ ...form, costPerUnit: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  value={form.batchNumber || ''}
                  onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                  placeholder="Batch or lot number"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Stock
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const StockChecklist: React.FC<StockChecklistProps> = ({ userRole }) => {
  const [stockItems, setStockItems] = useState<Stock[]>([]);
  const [filteredItems, setFilteredItems] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<StockFilter>({});
  const [showAddModal, setShowAddModal] = useState(false);

  const canEdit = userRole === 'ADMIN' || userRole === 'KITCHEN_MANAGER';

  // Load stock items
  useEffect(() => {
    const loadStock = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('kitchen_stock')
          .select('*')
          .eq('isActive', true)
          .order('itemName');

        if (error) throw error;
        setStockItems(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stock');
      } finally {
        setIsLoading(false);
      }
    };

    loadStock();
  }, []);

  // Real-time updates
  useEffect(() => {
    const channel = realtimeUtils.subscribeToStockUpdates((payload) => {
      if (payload.eventType === 'INSERT') {
        setStockItems(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'UPDATE') {
        setStockItems(prev => prev.map(item => 
          item.id === payload.new.id ? { ...item, ...payload.new } : item
        ));
      } else if (payload.eventType === 'DELETE') {
        setStockItems(prev => prev.filter(item => item.id !== payload.old.id));
      }
    });

    return () => {
      realtimeUtils.unsubscribe(channel);
    };
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = stockItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filter.category) {
      filtered = filtered.filter(item => item.category === filter.category);
    }

    // Low stock filter
    if (filter.lowStock) {
      filtered = filtered.filter(item => 
        item.minStock && item.quantity <= item.minStock
      );
    }

    // Expiring soon filter
    if (filter.expiringSoon) {
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item =>
        item.expiryDate && new Date(item.expiryDate) <= nextWeek
      );
    }

    setFilteredItems(filtered);
  }, [stockItems, searchTerm, filter]);

  const handleStockUpdate = (updatedStock: Stock) => {
    setStockItems(prev => prev.map(item => 
      item.id === updatedStock.id ? updatedStock : item
    ));
  };

  const handleStockAdd = (newStock: Stock) => {
    setStockItems(prev => [...prev, newStock]);
  };

  const refreshStock = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('kitchen_stock')
        .select('*')
        .eq('isActive', true)
        .order('itemName');

      if (error) throw error;
      setStockItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh stock');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [...new Set(stockItems.map(item => item.category))];
  const lowStockCount = stockItems.filter(item => 
    item.minStock && item.quantity <= item.minStock
  ).length;
  const expiringSoonCount = stockItems.filter(item => {
    if (!item.expiryDate) return false;
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return new Date(item.expiryDate) <= nextWeek;
  }).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Stock</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refreshStock} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Stock Inventory
              </CardTitle>
              <CardDescription>
                Manage kitchen inventory and track stock levels
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Button onClick={refreshStock} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              {canEdit && (
                <Button onClick={() => setShowAddModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stockItems.length}</div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
              <div className="text-sm text-gray-500">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{expiringSoonCount}</div>
              <div className="text-sm text-gray-500">Expiring Soon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items, categories, or suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={filter.category || ''}
                onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <Button
                variant={filter.lowStock ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter({ ...filter, lowStock: !filter.lowStock })}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Low Stock
              </Button>
              
              <Button
                variant={filter.expiringSoon ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter({ ...filter, expiringSoon: !filter.expiringSoon })}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Expiring Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Items */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stock Items Found</h3>
            <p className="text-gray-600">
              {searchTerm || Object.keys(filter).length > 0 
                ? 'Try adjusting your search or filters'
                : 'Start by adding some stock items to the inventory'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <StockItem
              key={item.id}
              item={item}
              onUpdate={handleStockUpdate}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleStockAdd}
      />
    </div>
  );
};

export default StockChecklist;