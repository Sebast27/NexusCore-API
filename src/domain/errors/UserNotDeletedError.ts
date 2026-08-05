import { DomainError } from './DomainError';

export class UserNotDeletedError extends DomainError {
  constructor(userId: string) {
    super(
      `User with id ${userId} is not deleted`,
      'USER_NOT_DELETED',
      { userId }
    );
  }
}