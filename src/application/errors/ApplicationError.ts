import { AppError } from '../../domain/errors/AppError';

export abstract class ApplicationError extends AppError {
  constructor(
    message: string,
    code: string,
    statusCode: number = 400,
    metadata?: Record<string, any>
  ) {
    super(message, code, statusCode, true, metadata);
  }
}