import { AppError } from '../AppError';

export class InvalidRefreshTokenError extends AppError {
  constructor() {
    super(
      'Invalid refresh token',
      'INVALID_REFRESH_TOKEN',
      401,
      true
    );
  }
}