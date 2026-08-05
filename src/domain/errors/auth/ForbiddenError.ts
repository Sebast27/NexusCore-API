import { AppError } from '../AppError';

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access') {
    super(
      message,
      'FORBIDDEN',
      403,
      true
    );
  }
}