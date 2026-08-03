import { PlainPassword } from '../value-objects/PlainPassword';

export class HashedPassword {
  private static readonly BCRYPT_REGEX = /^\$2[aby]\$\d+\$.+$/;
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static fromHash(hash: string): HashedPassword {
    if (!hash || hash.trim() === '') {
      throw new Error('Hashed password cannot be empty');
    }

    const trimmed = hash.trim();

    if (!HashedPassword.BCRYPT_REGEX.test(trimmed)) {
      throw new Error('Invalid bcrypt hash format');
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
    return plain.compare(this);
  }
}