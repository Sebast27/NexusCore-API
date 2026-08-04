import { AppError } from '../AppError';

export class InvalidTokenError extends AppError {
  constructor() {
    super(
      'Invalid or malformed token',
      'INVALID_TOKEN',
      401,
      true
    );
  }
}