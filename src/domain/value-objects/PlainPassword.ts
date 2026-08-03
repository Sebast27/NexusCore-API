import bcrypt from 'bcrypt';
import { HashedPassword } from '../value-objects/HashedPassword';

export class PlainPassword {
  private static readonly MIN_LENGTH = 8;
  private static readonly SALT_ROUNDS = 10;
  
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

  private static validate(value: string): void {
    for (const rule of PlainPassword.VALIDATION_RULES) {
      if (!rule.test(value)) {
        throw new Error(rule.message);
      }
    }
  }

  async hash(): Promise<HashedPassword> {
    const hashed = await bcrypt.hash(this.value, PlainPassword.SALT_ROUNDS);
    return HashedPassword.fromHash(hashed);
  }

  async compare(hashed: HashedPassword): Promise<boolean> {
    return bcrypt.compare(this.value, hashed.getValue());
  }
}