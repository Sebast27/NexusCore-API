import { ApplicationError } from './ApplicationError';

export class ValidationError extends ApplicationError {
  constructor(
    field: string,
    message: string
  ) {
    super(
      `Validation error on ${field}: ${message}`,
      'VALIDATION_ERROR',
      400,
      { field, validationMessage: message }
    );
  }

  // Para múltiples campos
  static fromFields(errors: Array<{ field: string; message: string }>): ValidationError  {
    return new ValidationError(
      'multiple fields',
      errors.map(e => `${e.field}: ${e.message}`).join('; ')
    );
  }
}