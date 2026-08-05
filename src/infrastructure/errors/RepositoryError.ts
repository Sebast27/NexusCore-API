import { InfrastructureError } from './InfrastructureError';

export class RepositoryError extends InfrastructureError {
  constructor(
    repository: string,
    operation: string,
    originalError?: any
  ) {
    super(
      `Repository ${repository} error on ${operation}`,
      'REPOSITORY_ERROR',
      { 
        repository, 
        operation,
        originalMessage: originalError?.message,
        ...(process.env.NODE_ENV === 'development' && {
          originalStack: originalError?.stack,
        }),
      }
    );
  }

  static saveFailed(repository: string, originalError?: any): RepositoryError {
    return new RepositoryError(repository, 'save', originalError);
  }

  static updateFailed(repository: string, originalError?: any): RepositoryError {
    return new RepositoryError(repository, 'update', originalError);
  }

  static deleteFailed(repository: string, originalError?: any): RepositoryError {
    return new RepositoryError(repository, 'delete', originalError);
  }

  static findFailed(repository: string, originalError?: any): RepositoryError {
    return new RepositoryError(repository, 'find', originalError);
  }

  static findByIdFailed(repository: string, originalError?: any): RepositoryError {
    return new RepositoryError(repository, 'findById', originalError);
  }

  static findByEmailFailed(repository: string, originalError?: any): RepositoryError {
    return new RepositoryError(repository, 'findByEmail', originalError);
  }
}