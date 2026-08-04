import { ValidationError } from '../../application/errors/ValidationError';
import { InvalidNameError } from '../errors/InvalidNameError';

export class Name {
  private readonly value: string;
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 100;
  private static readonly NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-'.]+$/;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Name {
    if (!value || value.trim() === '') {
      throw new ValidationError('name', 'Name cannot be empty');
    }

    const trimmed = value.trim();

    if (trimmed.length < Name.MIN_LENGTH) {
      throw new InvalidNameError(trimmed, 'Name must be at least ${Name.MIN_LENGTH} characters');
    }

    if (trimmed.length > Name.MAX_LENGTH) {
      throw new InvalidNameError(trimmed, 'Name cannot exceed ${Name.MAX_LENGTH} characters');
    }

    if (!Name.NAME_REGEX.test(trimmed)) {
      throw new InvalidNameError(trimmed, 'Name contains invalid characters. Only letters, spaces, hyphens, apostrophes and periods allowed');
    }

    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmed)) {
      throw new InvalidNameError(trimmed, 'Name must contain at least one letter');
    }

    if (trimmed.includes('  ')) {
      throw new InvalidNameError(trimmed,'Name cannot contain consecutive spaces');
    }

    if (/['-]{2,}/.test(trimmed)) {
      throw new InvalidNameError(trimmed,'Name cannot contain consecutive special characters');
    }

    const formatted = Name.formatName(trimmed);
    return new Name(formatted);
  }

  private static formatName(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => Name.capitalizeWord(word))
      .join(' ');
  }

  private static capitalizeWord(word: string): string {
    if (word.length === 0) return word;

    if (word.includes("'")) {
      return word
        .split("'")
        .map(part => part.charAt(0).toLocaleUpperCase() + part.slice(1))
        .join("'");
    }

    if (word.includes('-')) {
      return word
        .split('-')
        .map(part => part.charAt(0).toLocaleUpperCase() + part.slice(1))
        .join('-');
    }

    if (word.includes('.')) {
      return word.toUpperCase();
    }

    return word.charAt(0).toLocaleUpperCase() + word.slice(1);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Name): boolean {
    if (!other) { return false;}
    return this.value === other.getValue();
  }

  getInitials(): string {
    return this.value
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getFirstName(): string {
    return this.value.split(' ')[0];
  }

  getLastName(): string {
    const parts = this.value.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }
}