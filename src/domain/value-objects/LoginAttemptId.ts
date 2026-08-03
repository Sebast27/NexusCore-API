import { randomUUID } from 'crypto';

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
      throw new Error('LoginAttemptId cannot be empty');
    }
    return new LoginAttemptId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: LoginAttemptId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}