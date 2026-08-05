import { randomUUID } from 'crypto';
import { ValidationError } from '../../application/errors/ValidationError';
import { InvalidUserIdError } from '../errors/InvalidUserIdError';

export class UserId {
  private static readonly UUID_V4_REGEX = 
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(): UserId {
    return new UserId(randomUUID());
  }

  static fromString(value: string): UserId {
    if (!value || value.trim() === '') {
      throw new ValidationError('userId', 'UserId cannot be empty');
    }

    const trimmed = value.trim();

    if (!UserId.isValid(trimmed)) {
      throw new InvalidUserIdError(trimmed,'Invalid UUID v4 format. Expected: xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx');
    }

    return new UserId(trimmed.toLowerCase());
  }

  static isValid(value: string): boolean {
    if (!value) return false;
    return UserId.UUID_V4_REGEX.test(value.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId | null | undefined): boolean {
    return other instanceof UserId && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}