'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Save, 
  Calculator, 
  Package, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { KitchenEvent, CreateIndentForm, Stock } from '../types';
import { KitchenService } from '../services/kitchen.service';
import { supabase } from '../lib/supabase';

interface IndentFormProps {
  event: KitchenEvent;
  onSave: (indent: any) => void;
  onCancel: () => void;
}

interface IndentFormItem {
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  notes?: string;
  isInStock?: boolean;
  stockQuantity?: number;
}

const CATEGORIES = [
  'Rice',
  'Dal',
  'Vegetables',
  'Meat',
  'Chicken',
  'Fish',
  'Beverages',
  'Desserts',
  'Spices',
  'Oil',
  'Other'
];

const UNITS = [
  'kg',
  'grams',
  'liters',
  'ml',
  'pieces',
  'packets',
  'bunches'
];

const IndentForm: React.FC<IndentFormProps> = ({ event, onSave, onCancel }) => {
  const [items, setItems] = useState<IndentFormItem[]>([
    { itemName: '', category: '', quantity: 0, unit: 'kg', notes: '' }
  ]);
  const [stockItems, setStockItems] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stock items for checking availability
  useEffect(() => {
    const loadStock = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('kitchen_stock')
          .select('*')
          .eq('isActive', true);

        if (error) throw error;
        setStockItems(data || []);
      } catch (err) {
        console.error('Failed to load stock:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStock();
  }, []);

  // Auto-calculate quantities based on menu items
  const autoCalculateQuantities = () => {
    if (!event.menuItems) return;

    try {
      const calculatedItems = KitchenService.calculateQuantities(
        event.menuItems,
        event.guestCount
      );

      const formItems: IndentFormItem[] = calculatedItems.map(item => ({
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        notes: '',
        ...checkStockAvailability(item.itemName, item.quantity)
      }));

      setItems(formItems);
    } catch (err) {
      setError('Failed to calculate quantities');
    }
  };

  // Check if item is available in stock
  const checkStockAvailability = (itemName: string, requiredQuantity: number) => {
    const stockItem = stockItems.find(stock => 
      stock.itemName.toLowerCase() === itemName.toLowerCase()
    );

    return {
      isInStock: stockItem ? stockItem.quantity >= requiredQuantity : false,
      stockQuantity: stockItem?.quantity || 0
    };
  };

  // Add new item row
  const addItem = () => {
    setItems([...items, { 
      itemName: '', 
      category: '', 
      quantity: 0, 
      unit: 'kg', 
      notes: '' 
    }]);
  };

  // Remove item row
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Update item field
  const updateItem = (index: number, field: keyof IndentFormItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Check stock availability when item name or quantity changes
    if (field === 'itemName' || field === 'quantity') {
      const stockInfo = checkStockAvailability(
        updatedItems[index].itemName,
        updatedItems[index].quantity
      );
      updatedItems[index] = { ...updatedItems[index], ...stockInfo };
    }

    setItems(updatedItems);
  };

  // Validate form
  const validateForm = (): boolean => {
    const validItems = items.filter(item => 
      item.itemName.trim() && 
      item.category && 
      item.quantity > 0
    );

    if (validItems.length === 0) {
      setError('Please add at least one valid item');
      return false;
    }

    setError(null);
    return true;
  };

  // Save indent
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const validItems = items.filter(item => 
        item.itemName.trim() && 
        item.category && 
        item.quantity > 0
      );

      const formData: CreateIndentForm = {
        eventId: event.id,
        items: validItems.map(item => ({
          itemName: item.itemName.trim(),
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes?.trim()
        }))
      };

      const indent = await KitchenService.createIndent(formData, 'current-user-id'); // TODO: Get actual user ID
      onSave(indent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save indent');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Info */}
      <Card>
        <CardHeader>
          <CardTitle>Create Indent for {event.name}</CardTitle>
          <CardDescription>
            Event Date: {new Date(event.date).toLocaleDateString()} • 
            Guests: {event.guestCount} • 
            Type: {event.eventType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={autoCalculateQuantities}
              disabled={!event.menuItems || isLoading}
              className="flex-1"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Auto Calculate Quantities
            </Button>
            <Button
              variant="outline"
              onClick={addItem}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Required Items</CardTitle>
          <CardDescription>
            Add all items needed for this event. Stock availability is checked automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
              {/* Item Header */}
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  {item.isInStock ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      In Stock ({item.stockQuantity} {item.unit})
                    </Badge>
                  ) : item.itemName && (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Need to Purchase
                    </Badge>
                  )}
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Item Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`itemName-${index}`}>Item Name *</Label>
                  <Input
                    id={`itemName-${index}`}
                    value={item.itemName}
                    onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                    placeholder="e.g., Basmati Rice"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor={`category-${index}`}>Category *</Label>
                  <select
                    id={`category-${index}`}
                    value={item.category}
                    onChange={(e) => updateItem(index, 'category', e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor={`unit-${index}`}>Unit *</Label>
                  <select
                    id={`unit-${index}`}
                    value={item.unit}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  >
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor={`notes-${index}`}>Notes (Optional)</Label>
                <Input
                  id={`notes-${index}`}
                  value={item.notes || ''}
                  onChange={(e) => updateItem(index, 'notes', e.target.value)}
                  placeholder="Any special requirements or notes"
                  className="mt-1"
                />
              </div>
            </div>
          ))}

          {/* Add Item Button */}
          <Button
            variant="outline"
            onClick={addItem}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Item
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Indent
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default IndentForm;