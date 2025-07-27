import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Calendar, Users, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { ContactFormData } from '../../types/landing';
import { useContactForm } from '../../hooks/useContactForm';
import { cn } from '../../lib/utils';

interface ContactFormProps {
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ className }) => {
  const { isLoading, isSuccess, error, submitForm, resetForm } = useContactForm();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    eventType: '',
    eventDate: '',
    guestCount: 0,
    message: ''
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const eventTypes = [
    'Wedding',
    'Reception',
    'Corporate Event',
    'Cultural Program',
    'College Event',
    'Religious Gathering',
    'Other'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[+]?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.eventType) newErrors.eventType = 'Please select an event type';
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
    if (formData.guestCount <= 0) newErrors.guestCount = 'Please enter number of guests';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await submitForm(formData);
      // Reset form on success
      setFormData({
        name: '',
        phone: '',
        email: '',
        eventType: '',
        eventDate: '',
        guestCount: 0,
        message: ''
      });
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("bg-green-50 border border-green-200 rounded-2xl p-8 text-center", className)}
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">
          Thank You!
        </h3>
        <p className="text-green-700 mb-6">
          Your inquiry has been sent successfully. We'll get back to you within 24 hours.
        </p>
        <Button
          onClick={resetForm}
          variant="outline"
          className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
        >
          Send Another Message
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center"
        >
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Name and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name" className="text-gray-700 font-medium">
            Full Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={cn(
              "mt-2 h-12",
              errors.name && "border-red-500 focus:border-red-500"
            )}
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-gray-700 font-medium">
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={cn(
              "mt-2 h-12",
              errors.phone && "border-red-500 focus:border-red-500"
            )}
            placeholder="+91 98765 43210"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email" className="text-gray-700 font-medium">
          Email Address *
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={cn(
            "mt-2 h-12",
            errors.email && "border-red-500 focus:border-red-500"
          )}
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Event Type and Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="eventType" className="text-gray-700 font-medium">
            Event Type *
          </Label>
          <select
            id="eventType"
            value={formData.eventType}
            onChange={(e) => handleInputChange('eventType', e.target.value)}
            className={cn(
              "mt-2 h-12 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20",
              errors.eventType && "border-red-500 focus:border-red-500"
            )}
          >
            <option value="">Select event type</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.eventType && (
            <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>
          )}
        </div>

        <div>
          <Label htmlFor="eventDate" className="text-gray-700 font-medium">
            Event Date *
          </Label>
          <div className="relative">
            <Input
              id="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              className={cn(
                "mt-2 h-12 pl-10",
                errors.eventDate && "border-red-500 focus:border-red-500"
              )}
              min={new Date().toISOString().split('T')[0]}
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 mt-1" />
          </div>
          {errors.eventDate && (
            <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>
          )}
        </div>
      </div>

      {/* Guest Count */}
      <div>
        <Label htmlFor="guestCount" className="text-gray-700 font-medium">
          Expected Number of Guests *
        </Label>
        <div className="relative">
          <Input
            id="guestCount"
            type="number"
            value={formData.guestCount || ''}
            onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value) || 0)}
            className={cn(
              "mt-2 h-12 pl-10",
              errors.guestCount && "border-red-500 focus:border-red-500"
            )}
            placeholder="e.g., 150"
            min="1"
            max="1000"
          />
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 mt-1" />
        </div>
        {errors.guestCount && (
          <p className="text-red-500 text-sm mt-1">{errors.guestCount}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="message" className="text-gray-700 font-medium">
          Additional Message
        </Label>
        <div className="relative">
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-3 pl-10 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
            rows={4}
            placeholder="Tell us more about your event requirements, special requests, or any questions you have..."
          />
          <MessageCircle className="absolute left-3 top-5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Submit Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Sending...
            </div>
          ) : (
            <div className="flex items-center">
              <Send className="w-5 h-5 mr-3" />
              Send Inquiry
            </div>
          )}
        </Button>
      </motion.div>

      <p className="text-sm text-gray-500 text-center">
        We'll respond to your inquiry within 24 hours. For urgent requests, please call us directly.
      </p>
    </form>
  );
};

export default ContactForm;