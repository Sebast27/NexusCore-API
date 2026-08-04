import { DomainError } from './DomainError';

export class UserAlreadyDeletedError extends DomainError {
  constructor(userId: string) {
    super(
      `User with id ${userId} is already deleted`,
      'USER_ALREADY_DELETED',
      { userId }
    );
  }
}