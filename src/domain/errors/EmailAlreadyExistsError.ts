import { DomainError } from './DomainError';

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(
      `Email ${email} is already registered`,
      'EMAIL_ALREADY_EXISTS',
      { email }
    );
  }
}