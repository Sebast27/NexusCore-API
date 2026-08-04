import { DomainError } from './DomainError';

export class InvalidLoginAttemptIdError extends DomainError {
  constructor(
    id: string,
    reason: string,
    metadata?: Record<string, any>
  ) {
    super(
      `Invalid LoginAttemptId: ${reason}`,
      'INVALID_LOGIN_ATTEMPT_ID',
      { id, reason, ...metadata }
    );
  }

  static empty(): InvalidLoginAttemptIdError {
    return new InvalidLoginAttemptIdError('', 'LoginAttemptId cannot be empty');
  }

  static invalidFormat(id: string): InvalidLoginAttemptIdError {
    return new InvalidLoginAttemptIdError(
      id,
      'Invalid UUID v4 format. Expected: xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx'
    );
  }
}