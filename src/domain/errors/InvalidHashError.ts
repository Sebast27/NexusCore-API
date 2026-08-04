import { DomainError } from './DomainError';

export class InvalidHashError extends DomainError {
  constructor(
    algorithm: string,
    reason: string,
    metadata?: Record<string, any>
  ) {
    super(
      `Invalid ${algorithm} hash: ${reason}`,
      'INVALID_HASH',
      { algorithm, reason, ...metadata }
    );
  }

  // Factory para casos específicos
  static bcryptTooShort(): InvalidHashError {
    return new InvalidHashError(
      'bcrypt',
      'Hash is too short for bcrypt format'
    );
  }

  static bcryptInvalidVersion(version: string): InvalidHashError {
    return new InvalidHashError(
      'bcrypt',
      `Invalid version: ${version}`,
      { version }
    );
  }

  static bcryptInvalidRounds(rounds: number, min: number, max: number): InvalidHashError {
    return new InvalidHashError(
      'bcrypt',
      `Invalid rounds: ${rounds}. Must be between ${min} and ${max}`,
      { rounds, min, max }
    );
  }

  static bcryptMalformed(): InvalidHashError {
    return new InvalidHashError(
      'bcrypt',
      'Malformed bcrypt hash structure'
    );
  }
}