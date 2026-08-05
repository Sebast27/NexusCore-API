import { DomainError } from './DomainError';

export class InvalidVerificationTokenError extends DomainError {
  constructor() {
    super(
      'Invalid verification token',
      'INVALID_VERIFICATION_TOKEN'
    );
  }
}