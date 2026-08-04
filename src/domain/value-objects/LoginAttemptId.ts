import { randomUUID } from 'crypto';
import { ValidationError } from '../../application/errors/ValidationError';

export class LoginAttemptId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(): LoginAttemptId {
    return new LoginAttemptId(randomUUID());
  }

  static fromString(value: string): LoginAttemptId {
    if (!value || value.trim() === '') {
      throw new ValidationError('loginAttemptId', 'LoginAttemptId cannot be empty');
    }
    return new LoginAttemptId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: LoginAttemptId): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.getValue();
  }

  toString(): string {
    return this.value;
  }
}