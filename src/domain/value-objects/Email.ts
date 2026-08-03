
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MAX_LENGTH = 254; 
  private static readonly MIN_TLD_LENGTH = 2;
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

    const trimmed = value.trim();

    if (trimmed.length > Email.MAX_LENGTH) {
      throw new Error(`Email exceeds maximum length of ${Email.MAX_LENGTH} characters`);
    }

    const parts = trimmed.split('@');
    if (parts.length !== 2) {
      throw new Error('Invalid email format');
    }

    const domain = parts[1];
    const domainParts = domain.split('.');

    // Check if domain has at least one dot
    if (domainParts.length < 2) {
      throw new Error('Invalid email: domain must contain a dot');
    }

    const tld = domainParts[domainParts.length - 1];
    if (tld.length < Email.MIN_TLD_LENGTH) {
      throw new Error(`Invalid email: TLD must be at least ${Email.MIN_TLD_LENGTH} characters`);
    }

    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new Error('Invalid email format');
    }

    if (!/^[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}$/.test(domain)) {
      throw new Error('Invalid email: domain contains invalid characters');
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

  getDomain(): string {
    return this.value.split('@')[1];
  }

  getLocalPart(): string {
    return this.value.split('@')[0];
  }
}