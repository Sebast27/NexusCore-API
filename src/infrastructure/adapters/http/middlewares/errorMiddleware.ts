import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../../domain/errors/AppError';
import { ValidationError } from '../../../../application/errors/ValidationError';
import { 
  UnauthorizedError,
  ForbiddenError,
  TokenExpiredError,
  InvalidTokenError,
  MissingTokenError,
} from '../../../../domain/errors';
import { ErrorResponseFactory } from '../../../../application/dtos/CommonDTO';
import { ZodError } from 'zod';
import { InfrastructureError } from '../../../../infrastructure/errors/InfrastructureError';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log del error (estructurado para mejor seguimiento)
  const logEntry = {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
  };

  // ERRORES DE ZOD (Validación)
  if (err instanceof ZodError) {
    const firstError = err.issues[0];
    res.status(400).json(
      ErrorResponseFactory.create('VALIDATION_ERROR', firstError.message, {
        field: firstError.path.join('.'),
        errors: err.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      })
    );
    return;
  }

  // ERRORES DE INFRAESTRUCTURA (5xx)
  if (err instanceof InfrastructureError) {
    res.status(500).json(
      ErrorResponseFactory.create(
        'INTERNAL_SERVER_ERROR',
        'An internal error occurred'
      )
    );
    return;
  }

  // Si es un error conocido de la aplicación
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    // Incluir metadata si existe
    if (err.metadata && Object.keys(err.metadata).length > 0) {
      response.error.metadata = err.metadata;
    }

    // Incluir stack trace en desarrollo
    if (process.env.NODE_ENV === 'development') {
      response.error.stack = err.stack;
    }

    // Errores específicos con formato especial
    if (err instanceof ValidationError) {
      response.error.field = err.metadata?.field;
      response.error.validationMessage = err.metadata?.validationMessage;
    }

    if (err instanceof UnauthorizedError || 
        err instanceof TokenExpiredError || 
        err instanceof InvalidTokenError ||
        err instanceof MissingTokenError) {
      response.error.authenticate = true;
    }

    if (err instanceof ForbiddenError) {
      response.error.authorize = true;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Errores de validación específicos de Express
  if (err.name === 'ValidationError' || err.name === 'SyntaxError') {
    res.status(400).json(
      ErrorResponseFactory.create('BAD_REQUEST', err.message)
    );
    return;
  }

  // Error desconocido (no operacional)
  res.status(500).json(
    ErrorResponseFactory.create(
      'INTERNAL_SERVER_ERROR',
      process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
      process.env.NODE_ENV === 'development' ? { name: err.name } : undefined
    )
  );
}