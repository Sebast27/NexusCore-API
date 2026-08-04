import { DomainError } from './DomainError';

export class InvalidPasswordError extends DomainError {
  constructor(message: string) {
    super(
      message,
      'INVALID_PASSWORD'
    );
  }

  static tooShort(): InvalidPasswordError {
    return new InvalidPasswordError('Password must be at least 8 characters long');
  }

  static noUppercase(): InvalidPasswordError {
    return new InvalidPasswordError('Password must contain at least one uppercase letter');
  }

  static noLowercase(): InvalidPasswordError {
    return new InvalidPasswordError('Password must contain at least one lowercase letter');
  }

  static noNumber(): InvalidPasswordError {
    return new InvalidPasswordError('Password must contain at least one number');
  }

  static noSpecialChar(): InvalidPasswordError {
    return new InvalidPasswordError('Password must contain at least one special character');
  }
}