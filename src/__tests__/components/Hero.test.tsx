import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import Hero from '../../components/landing/Hero';
import { mockHeroProps } from '../utils/testUtils';

describe('Hero Component', () => {
  it('renders hero heading and subheading', () => {
    render(<Hero {...mockHeroProps} />);
    
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test Subheading')).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Hero {...mockHeroProps} />);
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('handles CTA button clicks', () => {
    // Mock getElementById for scroll action
    const mockElement = { scrollIntoView: jest.fn() };
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

    render(<Hero {...mockHeroProps} />);
    
    const button = screen.getByText('Test Button');
    fireEvent.click(button);
    
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('displays media indicators when multiple media items exist', () => {
    const propsWithMultipleMedia = {
      ...mockHeroProps,
      backgroundMedia: [
        ...mockHeroProps.backgroundMedia,
        {
          type: 'image' as const,
          src: '/test-bg-2.jpg',
          alt: 'Test background 2'
        }
      ]
    };

    render(<Hero {...propsWithMultipleMedia} />);
    
    // Should have navigation buttons and indicators
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('handles phone CTA action', () => {
    const phoneProps = {
      ...mockHeroProps,
      ctaButtons: [
        {
          text: 'Call Us',
          variant: 'primary' as const,
          action: 'phone' as const,
          target: '+1234567890'
        }
      ]
    };

    // Mock window.open
    const mockOpen = jest.fn();
    Object.defineProperty(window, 'open', { value: mockOpen });

    render(<Hero {...phoneProps} />);
    
    const button = screen.getByText('Call Us');
    fireEvent.click(button);
    
    expect(mockOpen).toHaveBeenCalledWith('tel:+1234567890', '_self');
  });

  it('handles WhatsApp CTA action', () => {
    const whatsappProps = {
      ...mockHeroProps,
      ctaButtons: [
        {
          text: 'WhatsApp',
          variant: 'secondary' as const,
          action: 'whatsapp' as const,
          target: '+1234567890'
        }
      ]
    };

    // Mock window.open
    const mockOpen = jest.fn();
    Object.defineProperty(window, 'open', { value: mockOpen });

    render(<Hero {...whatsappProps} />);
    
    const button = screen.getByText('WhatsApp');
    fireEvent.click(button);
    
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/1234567890'),
      '_blank'
    );
  });

  it('is accessible', async () => {
    render(<Hero {...mockHeroProps} />);
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Check for button accessibility
    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveAttribute('aria-disabled');
  });

  it('supports keyboard navigation', () => {
    render(<Hero {...mockHeroProps} />);
    
    const button = screen.getByText('Test Button');
    
    // Focus the button
    button.focus();
    expect(button).toHaveFocus();
    
    // Press Enter
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    // Should trigger the same action as click
  });
});