import { DomainError } from './DomainError';

export class EmailAlreadyVerifiedError extends DomainError {
  constructor(email: string) {
    super(
      `Email ${email} is already verified`,
      'EMAIL_ALREADY_VERIFIED',
      { email }
    );
  }
}