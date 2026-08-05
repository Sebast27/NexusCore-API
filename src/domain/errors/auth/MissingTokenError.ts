import { AppError } from '../AppError';

export class MissingTokenError extends AppError {
  constructor() {
    super(
      'Authentication token is required',
      'MISSING_TOKEN',
      401,
      true
    );
  }
}