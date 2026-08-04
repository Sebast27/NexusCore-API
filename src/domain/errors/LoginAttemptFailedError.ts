import { DomainError } from './DomainError';

export class LoginAttemptFailedError extends DomainError {
  constructor(email: string, reason: string) {
    super(
      `Login attempt failed for ${email}: ${reason}`,
      'LOGIN_ATTEMPT_FAILED',
      { email, reason }
    );
  }
}