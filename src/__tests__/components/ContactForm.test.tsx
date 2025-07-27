import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import ContactForm from '../../components/shared/ContactForm';

// Mock the useContactForm hook
jest.mock('../../hooks/useContactForm', () => ({
  useContactForm: () => ({
    isLoading: false,
    isSuccess: false,
    error: null,
    submitForm: jest.fn().mockResolvedValue(undefined),
    resetForm: jest.fn()
  })
}));

describe('ContactForm Component', () => {
  it('renders all form fields', () => {
    render(<ContactForm />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of guests/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/additional message/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<ContactForm />);
    
    const submitButton = screen.getByRole('button', { name: /send inquiry/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ContactForm />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /send inquiry/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    render(<ContactForm />);
    
    const phoneInput = screen.getByLabelText(/phone number/i);
    fireEvent.change(phoneInput, { target: { value: '123' } });
    
    const submitButton = screen.getByRole('button', { name: /send inquiry/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockSubmitForm = jest.fn().mockResolvedValue(undefined);
    
    // Re-mock the hook for this test
    jest.doMock('../../hooks/useContactForm', () => ({
      useContactForm: () => ({
        isLoading: false,
        isSuccess: false,
        error: null,
        submitForm: mockSubmitForm,
        resetForm: jest.fn()
      })
    }));

    render(<ContactForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), { 
      target: { value: '+1234567890' } 
    });
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/event type/i), { 
      target: { value: 'Wedding' } 
    });
    fireEvent.change(screen.getByLabelText(/event date/i), { 
      target: { value: '2024-12-31' } 
    });
    fireEvent.change(screen.getByLabelText(/number of guests/i), { 
      target: { value: '100' } 
    });
    
    const submitButton = screen.getByRole('button', { name: /send inquiry/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmitForm).toHaveBeenCalledWith({
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        eventType: 'Wedding',
        eventDate: '2024-12-31',
        guestCount: 100,
        message: ''
      });
    });
  });

  it('displays loading state', () => {
    // Mock loading state
    jest.doMock('../../hooks/useContactForm', () => ({
      useContactForm: () => ({
        isLoading: true,
        isSuccess: false,
        error: null,
        submitForm: jest.fn(),
        resetForm: jest.fn()
      })
    }));

    render(<ContactForm />);
    
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });

  it('displays success state', () => {
    // Mock success state
    jest.doMock('../../hooks/useContactForm', () => ({
      useContactForm: () => ({
        isLoading: false,
        isSuccess: true,
        error: null,
        submitForm: jest.fn(),
        resetForm: jest.fn()
      })
    }));

    render(<ContactForm />);
    
    expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    expect(screen.getByText(/your inquiry has been sent successfully/i)).toBeInTheDocument();
  });

  it('displays error state', () => {
    // Mock error state
    jest.doMock('../../hooks/useContactForm', () => ({
      useContactForm: () => ({
        isLoading: false,
        isSuccess: false,
        error: 'Something went wrong',
        submitForm: jest.fn(),
        resetForm: jest.fn()
      })
    }));

    render(<ContactForm />);
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('is accessible', () => {
    render(<ContactForm />);
    
    // Check for proper labels
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    
    // Check for required field indicators
    expect(screen.getByText(/full name \*/i)).toBeInTheDocument();
    expect(screen.getByText(/phone number \*/i)).toBeInTheDocument();
    expect(screen.getByText(/email address \*/i)).toBeInTheDocument();
  });
});