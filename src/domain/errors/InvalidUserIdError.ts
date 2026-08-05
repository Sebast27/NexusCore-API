import { DomainError } from './DomainError';

export class InvalidUserIdError extends DomainError {
  constructor(userId: string, reason?: string) {
    super(
      `Invalid User ID: ${userId}${reason ? ` - ${reason}` : ''}`,
      'INVALID_USER_ID',
      { userId, reason }
    );
  }
}