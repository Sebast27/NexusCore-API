import { DomainError } from './DomainError';

export class UserNotFoundByEmailError extends DomainError {
  constructor(email: string) {
    super(
      `User with email ${email} not found`,
      'USER_NOT_FOUND_BY_EMAIL',
      { email }
    );
  }
}