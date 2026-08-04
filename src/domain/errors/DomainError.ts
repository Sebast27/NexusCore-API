import { AppError } from './AppError';

export abstract class DomainError extends AppError {
  constructor(
    message: string,
    code: string,
    metadata?: Record<string, any>
  ) {
    super(message, code, 400, true, metadata);
  }
}