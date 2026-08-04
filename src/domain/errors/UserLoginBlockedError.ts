import { DomainError } from './DomainError';

export class UserLoginBlockedError extends DomainError {
  constructor(email: string, reason: string) {
    super(
      `User with email ${email} cannot login: ${reason}`,
      'USER_LOGIN_BLOCKED',
      { email, reason }
    );
  }
}