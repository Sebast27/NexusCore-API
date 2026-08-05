import { ApplicationError } from './ApplicationError';

export class ConflictError extends ApplicationError {
  constructor(
    message: string,
    metadata?: Record<string, any>
  ) {
    super(
      `Conflict: ${message}`,
      'CONFLICT',
      409,
      metadata
    );
  }
}