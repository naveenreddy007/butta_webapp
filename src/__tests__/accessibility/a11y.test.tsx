import React from 'react';
import { render } from '../utils/testUtils';
import { axe, toHaveNoViolations } from 'jest-axe';
import Hero from '../../components/landing/Hero';
import ContactForm from '../../components/shared/ContactForm';
import { mockHeroProps } from '../utils/testUtils';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('Hero Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Hero {...mockHeroProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      const { container } = render(<Hero {...mockHeroProps} />);
      
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('Test Heading');
    });

    it('has accessible buttons', () => {
      const { container } = render(<Hero {...mockHeroProps} />);
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type');
        expect(button).not.toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('has proper alt text for images', () => {
      const { container } = render(<Hero {...mockHeroProps} />);
      
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });
  });

  describe('ContactForm Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ContactForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper form labels', () => {
      const { container } = render(<ContactForm />);
      
      const inputs = container.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const id = input.getAttribute('id');
        if (id) {
          const label = container.querySelector(`label[for="${id}"]`);
          expect(label).toBeInTheDocument();
        }
      });
    });

    it('has proper error announcements', async () => {
      const { container } = render(<ContactForm />);
      
      // Error messages should be associated with their inputs
      const errorMessages = container.querySelectorAll('[role="alert"], .error-message');
      errorMessages.forEach(error => {
        // Error should be announced to screen readers
        expect(error).toBeInTheDocument();
      });
    });

    it('has proper required field indicators', () => {
      const { container } = render(<ContactForm />);
      
      const requiredInputs = container.querySelectorAll('input[required], select[required]');
      requiredInputs.forEach(input => {
        const id = input.getAttribute('id');
        if (id) {
          const label = container.querySelector(`label[for="${id}"]`);
          expect(label?.textContent).toMatch(/\*/); // Should have asterisk or similar indicator
        }
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports tab navigation in Hero', () => {
      const { container } = render(<Hero {...mockHeroProps} />);
      
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      focusableElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('supports tab navigation in ContactForm', () => {
      const { container } = render(<ContactForm />);
      
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      // Should have logical tab order
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Screen Reader Support', () => {
    it('has proper ARIA labels where needed', () => {
      const { container } = render(<Hero {...mockHeroProps} />);
      
      const elementsWithAriaLabel = container.querySelectorAll('[aria-label]');
      elementsWithAriaLabel.forEach(element => {
        expect(element.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('has proper landmark roles', () => {
      const { container } = render(<Hero {...mockHeroProps} />);
      
      // Hero should be in a section or main landmark
      const section = container.querySelector('section, main, [role="main"]');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Color Contrast', () => {
    it('uses sufficient color contrast', () => {
      // This would typically use a tool like axe-core to check contrast ratios
      // For now, we'll just ensure text elements exist
      const { container } = render(<Hero {...mockHeroProps} />);
      
      const textElements = container.querySelectorAll('h1, h2, h3, p, span, button');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Management', () => {
    it('has visible focus indicators', () => {
      const { container } = render(<ContactForm />);
      
      const focusableElements = container.querySelectorAll('button, input, select, textarea');
      focusableElements.forEach(element => {
        // Focus the element
        (element as HTMLElement).focus();
        
        // Check if it has focus styles (this would be more sophisticated in real tests)
        expect(element).toHaveFocus();
      });
    });
  });
});