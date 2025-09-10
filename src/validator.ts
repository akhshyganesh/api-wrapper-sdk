import { QueryParams, RequestBody, ValidationError } from './types';

interface FieldConfig {
  required?: boolean;
  type: string;
  description?: string;
}

export class Validator {
  static validateQueryParams(params: QueryParams, schema: Record<string, FieldConfig>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!schema) return errors;

    // Check required fields
    for (const [field, config] of Object.entries(schema)) {
      const value = params[field];
      const fieldConfig = config;

      if (fieldConfig.required && (value === undefined || value === null)) {
        errors.push({
          field,
          message: 'Required field is missing',
          expectedType: fieldConfig.type,
          actualValue: value,
        });
        continue;
      }

      if (value !== undefined && value !== null) {
        const isValid = this.validateType(value, fieldConfig.type);
        if (!isValid) {
          errors.push({
            field,
            message: `Type mismatch`,
            expectedType: fieldConfig.type,
            actualValue: value,
          });
        }
      }
    }

    return errors;
  }

  static validateRequestBody(body: RequestBody, schema: Record<string, FieldConfig>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!schema) return errors;

    // Check required fields
    for (const [field, config] of Object.entries(schema)) {
      const value = body[field];
      const fieldConfig = config;

      if (fieldConfig.required && (value === undefined || value === null)) {
        errors.push({
          field,
          message: 'Required field is missing',
          expectedType: fieldConfig.type,
          actualValue: value,
        });
        continue;
      }

      if (value !== undefined && value !== null) {
        const isValid = this.validateType(value, fieldConfig.type);
        if (!isValid) {
          errors.push({
            field,
            message: `Type mismatch`,
            expectedType: fieldConfig.type,
            actualValue: value,
          });
        }
      }
    }

    return errors;
  }

  private static validateType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true; // Unknown types pass validation
    }
  }
}
