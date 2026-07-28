import bcrypt from 'bcrypt';

export class Password {
  private static readonly MIN_LENGTH = 8;
  private static readonly SALT_ROUNDS = 10;
  
  private static readonly VALIDATION_RULES = [
    {
      test: (value: string) => value.length >= Password.MIN_LENGTH,
      message: `Password must be at least ${Password.MIN_LENGTH} characters long`,
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

  static create(value: string): Password {
    Password.validate(value);
    return new Password(value);
  }

  private static validate(value: string): void {
    for (const rule of Password.VALIDATION_RULES) {
      if (!rule.test(value)) {
        throw new Error(rule.message);
      }
    }
  }

  async hash(): Promise<string> {
    return bcrypt.hash(this.value, Password.SALT_ROUNDS);
  }

  static async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  getValue(): string {
    return this.value;
  }

  static createFromHash(hash: string): Password {
    return new Password(hash);
  }
}