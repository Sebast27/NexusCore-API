import { DomainError } from './DomainError';

export class InvalidNameError extends DomainError {
  constructor(
    name: string,
    reason: string,
    metadata?: Record<string, any>
  ) {
    super(
      `Invalid name: ${reason}`,
      'INVALID_NAME',
      { name, reason, ...metadata }
    );
  }

  // Factory methods para casos específicos
  static empty(): InvalidNameError {
    return new InvalidNameError('', 'Name cannot be empty');
  }

  static tooShort(name: string, minLength: number): InvalidNameError {
    return new InvalidNameError(
      name,
      `Name must be at least ${minLength} characters`
    );
  }

  static tooLong(name: string, maxLength: number): InvalidNameError {
    return new InvalidNameError(
      name,
      `Name cannot exceed ${maxLength} characters`
    );
  }

  static invalidCharacters(name: string): InvalidNameError {
    return new InvalidNameError(
      name,
      'Name contains invalid characters. Only letters, spaces, hyphens, apostrophes and periods allowed'
    );
  }

  static noLetters(name: string): InvalidNameError {
    return new InvalidNameError(
      name,
      'Name must contain at least one letter'
    );
  }

  static consecutiveSpaces(name: string): InvalidNameError {
    return new InvalidNameError(
      name,
      'Name cannot contain consecutive spaces'
    );
  }

  static consecutiveSpecialChars(name: string): InvalidNameError {
    return new InvalidNameError(
      name,
      'Name cannot contain consecutive special characters'
    );
  }
}