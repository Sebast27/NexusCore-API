import { AppError } from '../AppError';

export class RefreshTokenExpiredError extends AppError {
  constructor() {
    super(
      'Refresh token has expired',
      'REFRESH_TOKEN_EXPIRED',
      401,
      true
    );
  }
}