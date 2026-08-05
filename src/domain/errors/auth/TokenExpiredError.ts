import { AppError } from '../AppError';

export class TokenExpiredError extends AppError {
  constructor() {
    super(
      'Token has expired',
      'TOKEN_EXPIRED',
      401,
      true
    );
  }
}