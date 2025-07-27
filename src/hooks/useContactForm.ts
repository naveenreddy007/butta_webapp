import { useState } from 'react';
import type { ContactFormData } from '../types/landing';

interface UseContactFormReturn {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  submitForm: (data: ContactFormData) => Promise<void>;
  resetForm: () => void;
}

export const useContactForm = (): UseContactFormReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitForm = async (data: ContactFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call - replace with actual EmailJS or backend integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log form data for now
      console.log('Form submitted:', data);
      
      // Create WhatsApp message
      const whatsappMessage = `
New Inquiry from Butta Convention Website:
Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email}
Event Type: ${data.eventType}
Event Date: ${data.eventDate}
Guest Count: ${data.guestCount}
Message: ${data.message}
      `.trim();
      
      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/918801886108?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
      
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to submit form. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setError(null);
  };

  return {
    isLoading,
    isSuccess,
    error,
    submitForm,
    resetForm
  };
};