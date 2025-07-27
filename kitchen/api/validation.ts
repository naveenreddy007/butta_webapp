/**
 * API Validation Utilities
 * 
 * Provides validation functions for API requests and data
 */
export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validation utility class
 */
export class Validator {
  /**
   * Validate data against rules
   */
  static validate(data: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    rules.forEach(rule => {
      const value = data[rule.field];
      const fieldErrors = this.validateField(rule.field, value, rule);
      errors.push(...fieldErrors);
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a single field
   */
  private static validateField(fieldName: string, value: any, rule: ValidationRule): string[] {
    const errors: string[] = [];

    // Check required
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldName} is required`);
      return errors; // Don't continue validation if required field is missing
    }

    // Skip validation if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return errors;
    }

    // Type validation
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${fieldName} must be a string`);
        } else {
          if (rule.min && value.length < rule.min) {
            errors.push(`${fieldName} must be at least ${rule.min} characters long`);
          }
          if (rule.max && value.length > rule.max) {
            errors.push(`${fieldName} must be at most ${rule.max} characters long`);
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${fieldName} format is invalid`);
          }
          if (rule.enum && !rule.enum.includes(value)) {
            errors.push(`${fieldName} must be one of: ${rule.enum.join(', ')}`);
          }
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`${fieldName} must be a valid number`);
        } else {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(`${fieldName} must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push(`${fieldName} must be at most ${rule.max}`);
          }
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${fieldName} must be a boolean`);
        }
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${fieldName} must be a valid date`);
        }
        break;

      case 'email':
        if (typeof value !== 'string') {
          errors.push(`${fieldName} must be a string`);
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${fieldName} must be a valid email address`);
          }
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${fieldName} must be an array`);
        } else {
          if (rule.min && value.length < rule.min) {
            errors.push(`${fieldName} must have at least ${rule.min} items`);
          }
          if (rule.max && value.length > rule.max) {
            errors.push(`${fieldName} must have at most ${rule.max} items`);
          }
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push(`${fieldName} must be an object`);
        }
        break;
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (typeof customResult === 'string') {
        errors.push(customResult);
      } else if (customResult === false) {
        errors.push(`${fieldName} failed custom validation`);
      }
    }

    return errors;
  }

  /**
   * Validate event data
   */
  static validateEvent(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      { field: 'name', type: 'string', required: true, min: 1, max: 100 },
      { field: 'date', type: 'date', required: true },
      { field: 'guestCount', type: 'number', required: true, min: 1, max: 1000 },
      { field: 'eventType', type: 'string', required: true, min: 1, max: 50 },
      { field: 'status', type: 'string', enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
      { field: 'assignedChef', type: 'string' }
    ];
    return this.validate(data, rules);
  }

  /**
   * Validate indent data
   */
  static validateIndent(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      { field: 'eventId', type: 'string', required: true },
      { field: 'items', type: 'array', required: true, min: 1 },
      { field: 'status', type: 'string', enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'] }
    ];

    const result = this.validate(data, rules);

    // Validate items array
    if (Array.isArray(data.items)) {
      data.items.forEach((item: any, index: number) => {
        const itemRules: ValidationRule[] = [
          { field: 'itemName', type: 'string', required: true, min: 1, max: 100 },
          { field: 'category', type: 'string', required: true, min: 1, max: 50 },
          { field: 'quantity', type: 'number', required: true, min: 0.1 },
          { field: 'unit', type: 'string', required: true, min: 1, max: 20 }
        ];

        const itemResult = this.validate(item, itemRules);
        itemResult.errors.forEach(error => {
          result.errors.push(`Item ${index + 1}: ${error}`);
        });
      });
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate cooking task data
   */
  static validateCookingTask(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      { field: 'eventId', type: 'string', required: true },
      { field: 'dishName', type: 'string', required: true, min: 1, max: 100 },
      { field: 'category', type: 'string', required: true, min: 1, max: 50 },
      { field: 'servings', type: 'number', required: true, min: 1 },
      { field: 'assignedTo', type: 'string', required: true },
      { field: 'status', type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'] },
      { field: 'priority', type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
      { field: 'estimatedTime', type: 'number', min: 1, max: 480 } // Max 8 hours
    ];
    return this.validate(data, rules);
  }

  /**
   * Validate stock item data
   */
  static validateStock(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      { field: 'itemName', type: 'string', required: true, min: 1, max: 100 },
      { field: 'category', type: 'string', required: true, min: 1, max: 50 },
      { field: 'quantity', type: 'number', required: true, min: 0 },
      { field: 'unit', type: 'string', required: true, min: 1, max: 20 },
      { field: 'costPerUnit', type: 'number', min: 0 },
      { field: 'minStock', type: 'number', min: 0 },
      { field: 'expiryDate', type: 'date' },
      { field: 'batchNumber', type: 'string', max: 50 },
      { field: 'supplier', type: 'string', max: 100 }
    ];
    return this.validate(data, rules);
  }

  /**
   * Validate stock quantity update data
   */
  static validateStockQuantityUpdate(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      { field: 'type', type: 'string', required: true, enum: ['ADDED', 'REMOVED', 'USED', 'EXPIRED', 'DAMAGED'] },
      { field: 'quantity', type: 'number', required: true, min: 0.1 },
      { field: 'reason', type: 'string', required: true, min: 1, max: 200 }
    ];
    return this.validate(data, rules);
  }

  /**
   * Validate user data
   */
  static validateUser(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      { field: 'name', type: 'string', required: true, min: 1, max: 100 },
      { field: 'email', type: 'email', required: true },
      { field: 'role', type: 'string', required: true, enum: ['ADMIN', 'KITCHEN_MANAGER', 'CHEF'] },
      { field: 'isActive', type: 'boolean' }
    ];
    return this.validate(data, rules);
  }

  /**
   * Validate query parameters
   */
  static validateQueryParams(data: any, allowedParams: string[]): ValidationResult {
    const errors: string[] = [];
    
    Object.keys(data).forEach(key => {
      if (!allowedParams.includes(key)) {
        errors.push(`Invalid query parameter: ${key}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize input data
   */
  static sanitize(data: any): any {
    if (typeof data === 'string') {
      return data.trim();
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      Object.keys(data).forEach(key => {
        sanitized[key] = this.sanitize(data[key]);
      });
      return sanitized;
    }
    
    return data;
  }
}