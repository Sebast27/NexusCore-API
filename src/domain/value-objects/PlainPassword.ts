import bcrypt from 'bcrypt';
import { HashedPassword } from '../value-objects/HashedPassword';
import { ValidationError } from '../../application/errors/ValidationError';
import { InvalidPasswordError } from '../errors/InvalidPasswordError';
import { HashError } from '../errors/HashError';

export class PlainPassword {
  private static readonly MIN_LENGTH = 8;
  
  private static get SALT_ROUNDS(): number {
    return parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  }
  
  private static readonly VALIDATION_RULES = [
    {
      test: (value: string) => value.length >= PlainPassword.MIN_LENGTH,
      message: `Password must be at least ${PlainPassword.MIN_LENGTH} characters long`,
    },
    {
      test: (value: string) => /[A-Z]/.test(value),
      message: 'Password must contain at least one uppercase letter',
    },
    {
      test: (value: string) => /[a-z]/.test(value),
      message: 'Password must contain at least one lowercase letter',
    },
    {
      test: (value: string) => /[0-9]/.test(value),
      message: 'Password must contain at least one number',
    },
    {
      test: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
      message: 'Password must contain at least one special character',
    },
  ];

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): PlainPassword {
    PlainPassword.validate(value);
    return new PlainPassword(value);
  }

  
  // Crea una contraseña para LOGIN - Sin validación, solo guarda el valor
  static createForComparison(value: string): PlainPassword {
    return new PlainPassword(value);
  }

  private static validate(value: string): void {
    for (const rule of PlainPassword.VALIDATION_RULES) {
      if (!rule.test(value)) {
        throw new InvalidPasswordError(rule.message);
      }
    }
  }

  async hash(): Promise<HashedPassword> {
    try {
      const hashed = await bcrypt.hash(this.value, PlainPassword.SALT_ROUNDS);
      return HashedPassword.fromHash(hashed);
    } catch (error) {
      throw new HashError(
        'bcrypt',
        'Failed to hash password',
        error instanceof Error ? error : undefined
      );
    }
  }

  async compare(hashed: HashedPassword): Promise<boolean> {
    if (!hashed) {
      throw new ValidationError('hashedPassword', 'Hashed password is required for comparison');
    }

    try {
      return bcrypt.compare(this.value, hashed.getValue());
    } catch (error) {
      throw new HashError(
        'bcrypt',
        'Failed to compare passwords',
        error instanceof Error ? error : undefined
      );
    }
  }

  getValue(): string {
    return this.value;
  }
}