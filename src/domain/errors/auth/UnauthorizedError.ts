import { AppError } from '../AppError';

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(
      message,
      'UNAUTHORIZED',
      401,
      true
    );
  }
}