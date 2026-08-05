import { DomainError } from './DomainError';

export class InvalidEmailError extends DomainError {
  constructor(email: string, reason?: string) {
    super(
      `Invalid email: ${email}${reason ? ` - ${reason}` : ''}`,
      'INVALID_EMAIL',
      { email, reason }
    );
  }
}