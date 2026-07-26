export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Email {
    Email.validateValue(value);
    return new Email(Email.normalize(value));
  }

  private static validateValue(value: string): void {
    if (!value || value.trim() === '') {
      throw new Error('Email cannot be empty');
    }

    if (!Email.EMAIL_REGEX.test(value)) {
      throw new Error('Invalid email format');
    }
  }

  private static normalize(value: string): string {
    return value.toLowerCase().trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.getValue();
  }
}