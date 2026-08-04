import { InfrastructureError } from '../../infrastructure/errors/InfrastructureError';

export class HashError extends InfrastructureError {
  constructor(
    algorithm: string,
    message: string,
    originalError?: Error
  ) {
    super(
      `${algorithm} hash error: ${message}`,
      'HASH_ERROR',
      { 
        algorithm,
        originalMessage: originalError?.message,
        ...(process.env.NODE_ENV === 'development' && {
          originalStack: originalError?.stack,
        }),
      }
    );
  }

  static hashFailed(algorithm: string, originalError?: Error): HashError {
    return new HashError(
      algorithm,
      'Failed to generate hash',
      originalError
    );
  }

  static compareFailed(algorithm: string, originalError?: Error): HashError {
    return new HashError(
      algorithm,
      'Failed to compare hashes',
      originalError
    );
  }

  static invalidAlgorithm(algorithm: string): HashError {
    return new HashError(
      algorithm,
      'Invalid or unsupported algorithm'
    );
  }
}