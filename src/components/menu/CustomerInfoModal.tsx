import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, User, Calendar, Clock, Users, Phone, Mail, Heart } from 'lucide-react';
import { useButtaMenu } from '@/context/ButtaMenuContext';

interface CustomerInfo {
  name: string;
  mobile: string;
  email: string;
  pax: string;
  eventDate: string;
  eventType: string;
  eventTime: string;
}

interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customerInfo: CustomerInfo) => void;
}

export function CustomerInfoModal({ isOpen, onClose, onSubmit }: CustomerInfoModalProps) {
  const { state } = useButtaMenu();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    mobile: '',
    email: '',
    pax: '',
    eventDate: '',
    eventType: '',
    eventTime: '',
  });

  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!customerInfo.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(customerInfo.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!customerInfo.pax.trim()) {
      newErrors.pax = 'Number of guests is required';
    } else if (isNaN(Number(customerInfo.pax)) || Number(customerInfo.pax) <= 0) {
      newErrors.pax = 'Please enter a valid number of guests';
    }

    if (!customerInfo.eventDate) {
      newErrors.eventDate = 'Event date is required';
    }

    if (!customerInfo.eventType.trim()) {
      newErrors.eventType = 'Event type is required';
    }

    if (!customerInfo.eventTime) {
      newErrors.eventTime = 'Event time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(customerInfo);
      onClose();
    }
  };

  const totalItems = state.selectedItems.reduce((sum, s) => sum + s.quantity, 0);
  const baseItems = state.selectedItems.filter(s => !s.isAddOn);
  const addOnItems = state.selectedItems.filter(s => s.isAddOn);

  const eventTypes = [
    'Marriage/Wedding',
    'Birthday Party',
    'Anniversary',
    'Corporate Event',
    'Festival Celebration',
    'House Warming',
    'Engagement',
    'Baby Shower',
    'Other'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden"
        >
          <Card className="h-full">
            <CardHeader className="border-b bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Event Details & Customer Information
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Customer Information Form */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-1">
                          Your Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={customerInfo.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Mobile Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="mobile"
                          placeholder="+91 98765 43210"
                          value={customerInfo.mobile}
                          onChange={(e) => handleInputChange('mobile', e.target.value)}
                          className={errors.mobile ? 'border-red-500' : ''}
                        />
                        {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email Address <span className="text-gray-500">(Optional)</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={customerInfo.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Event Details
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pax" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Number of Guests (Pax) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="pax"
                          type="number"
                          placeholder="e.g., 100"
                          value={customerInfo.pax}
                          onChange={(e) => handleInputChange('pax', e.target.value)}
                          className={errors.pax ? 'border-red-500' : ''}
                        />
                        {errors.pax && <p className="text-red-500 text-sm">{errors.pax}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eventDate" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Event Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="eventDate"
                          type="date"
                          value={customerInfo.eventDate}
                          onChange={(e) => handleInputChange('eventDate', e.target.value)}
                          className={errors.eventDate ? 'border-red-500' : ''}
                        />
                        {errors.eventDate && <p className="text-red-500 text-sm">{errors.eventDate}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eventType" className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          Event Type <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="eventType"
                          value={customerInfo.eventType}
                          onChange={(e) => handleInputChange('eventType', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.eventType ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select event type</option>
                          {eventTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {errors.eventType && <p className="text-red-500 text-sm">{errors.eventType}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eventTime" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Event Time <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="eventTime"
                          type="time"
                          value={customerInfo.eventTime}
                          onChange={(e) => handleInputChange('eventTime', e.target.value)}
                          className={errors.eventTime ? 'border-red-500' : ''}
                        />
                        {errors.eventTime && <p className="text-red-500 text-sm">{errors.eventTime}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Menu Items */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Selected Menu Items ({totalItems} items)
                    </h3>

                    {/* Base Items */}
                    {baseItems.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-green-100 text-green-800">Base Menu Items</Badge>
                          <span className="text-sm text-gray-600">({baseItems.length} items)</span>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {baseItems.map((selection, index) => (
                            <div key={selection.item.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-800">
                                    {index + 1}. {selection.item.name}
                                  </span>
                                  {selection.item.dietaryRestrictions?.includes('vegetarian') && (
                                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                      🌱 Veg
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-1">{selection.item.description}</p>
                              </div>
                              <Badge className="bg-green-600 text-white text-xs">
                                Qty: {selection.quantity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add-on Items */}
                    {addOnItems.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-orange-100 text-orange-800">Add-on Items</Badge>
                          <span className="text-sm text-gray-600">({addOnItems.length} items)</span>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {addOnItems.map((selection, index) => (
                            <div key={selection.item.id} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-800">
                                    {baseItems.length + index + 1}. {selection.item.name}
                                  </span>
                                  {selection.item.dietaryRestrictions?.includes('vegetarian') && (
                                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                      🌱 Veg
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-1">{selection.item.description}</p>
                              </div>
                              <Badge className="bg-orange-600 text-white text-xs">
                                Qty: {selection.quantity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Order Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Base Items:</span>
                          <span className="font-medium ml-2">{baseItems.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Add-on Items:</span>
                          <span className="font-medium ml-2">{addOnItems.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Quantity:</span>
                          <span className="font-medium ml-2">{totalItems}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Categories:</span>
                          <span className="font-medium ml-2">{state.categoryLimits.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Actions */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  Generate Menu PDF
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}