import { DomainError } from './DomainError';

export class UserEmailAlreadyVerifiedError extends DomainError {
  constructor(email: string) {
    super(
      `User with email ${email} already has verified email`,
      'USER_EMAIL_ALREADY_VERIFIED',
      { email }
    );
  }
}