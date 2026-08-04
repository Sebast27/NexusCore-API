import { PlainPassword } from '../value-objects/PlainPassword';
import { ValidationError } from '../../application/errors/ValidationError';
import { InvalidHashError } from '../errors/InvalidHashError';

export class HashedPassword {
  private static readonly BCRYPT_REGEX = /^\$2[aby]\$\d+\$.+$/;
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static fromHash(hash: string): HashedPassword {
    if (!hash || hash.trim() === '') {
      throw new ValidationError('hashedPassword', 'Hashed password cannot be empty');
    }

    const trimmed = hash.trim();

    if (!HashedPassword.BCRYPT_REGEX.test(trimmed)) {
      throw new InvalidHashError('bcrypt', 'Invalid bcrypt hash format');
    }

    return new HashedPassword(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: HashedPassword): boolean {
    return this.value === other.value;
  }

  async verify(plain: PlainPassword): Promise<boolean> {
    if (!plain) {
      throw new ValidationError('plainPassword', 'Plain password is required for verification');
    }
    return plain.compare(this);
  }
}