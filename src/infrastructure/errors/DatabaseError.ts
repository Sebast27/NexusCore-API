import { InfrastructureError } from './InfrastructureError';

export class DatabaseError extends InfrastructureError {
  constructor(
    message: string,
    originalError?: any
  ) {
    super(
      `Database error: ${message}`,
      'DATABASE_ERROR',
      { 
        originalMessage: originalError?.message,
        originalCode: originalError?.code,
        ...(process.env.NODE_ENV === 'development' && {
          originalStack: originalError?.stack,
        }),
      }
    );
  }

  static connectionFailed(originalError?: any): DatabaseError {
    return new DatabaseError('Failed to connect to database', originalError);
  }

  static queryFailed(message: string, originalError?: any): DatabaseError {
    return new DatabaseError(`Query failed: ${message}`, originalError);
  }

  static transactionFailed(message: string, originalError?: any): DatabaseError {
    return new DatabaseError(`Transaction failed: ${message}`, originalError);
  }

  static uniqueConstraintFailed(table: string, field: string, value: string): DatabaseError {
    return new DatabaseError(`Unique constraint violation on ${table}.${field}: ${value}`);
  }

  static foreignKeyConstraintFailed(table: string, field: string): DatabaseError {
    return new DatabaseError(`Foreign key constraint violation on ${table}.${field}`);
  }

  static recordNotFound(table: string, id: string): DatabaseError {
    return new DatabaseError(`Record not found in ${table} with id: ${id}`);
  }
}