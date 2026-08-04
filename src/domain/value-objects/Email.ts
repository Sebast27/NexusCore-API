import { ValidationError } from '../../application/errors/ValidationError';
import { InvalidEmailError } from '../errors/InvalidEmailError';

export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly VALID_TLDS = ['com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'uk', 'es', 'mx', 'ar', 'cl', 'pe'];
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
      throw new ValidationError('email', 'Email cannot be empty');
    }

    const trimmed = value.trim();

    if (trimmed.length > Email.MAX_LENGTH) {
      throw new ValidationError(
        'email', 
        `Email exceeds maximum length of ${Email.MAX_LENGTH} characters`
      );
    }

    const parts = trimmed.split('@');
    if (parts.length !== 2) {
      throw new InvalidEmailError(trimmed, 'Invalid email format (missing @)');
    }

    const localPart = parts[0];
    const domain = parts[1];

    // Validar que el local part no esté vacío
    if (!localPart || localPart.length === 0) {
      throw new InvalidEmailError(trimmed, 'Local part cannot be empty');
    }

    // Validar que el dominio no esté vacío
    if (!domain || domain.length === 0) {
      throw new InvalidEmailError(trimmed, 'Domain cannot be empty');
    }

    const domainParts = domain.split('.');

    // Validar que el dominio tenga al menos un punto
    if (domainParts.length < 2) {
      throw new InvalidEmailError(trimmed, 'Domain must contain a dot');
    }

    // Validar TLD
    const tld = domainParts[domainParts.length - 1].toLowerCase();
    if (tld.length < Email.MIN_TLD_LENGTH) {
      throw new InvalidEmailError(
        trimmed, 
        `TLD must be at least ${Email.MIN_TLD_LENGTH} characters`
      );
    }

    if (!Email.VALID_TLDS.includes(tld)) {
      throw new InvalidEmailError(
        trimmed, 
        `Invalid TLD: ${tld}. Valid TLDs: ${Email.VALID_TLDS.join(', ')}`
      );
    }

    // Validar formato general
    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new InvalidEmailError(trimmed, 'Invalid email format');
    }

    // Validar caracteres del dominio
    if (!/^[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}$/.test(domain)) {
      throw new InvalidEmailError(trimmed, 'Domain contains invalid characters');
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