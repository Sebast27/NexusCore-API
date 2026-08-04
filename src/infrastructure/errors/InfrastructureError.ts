import { AppError } from '../../domain/errors/AppError';

export abstract class InfrastructureError extends AppError {
  constructor(
    message: string,
    code: string,
    metadata?: Record<string, any>
  ) {
    super(message, code, 500, false, metadata);
  }
}