import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { ErrorResponseFactory } from '../../../../application/dtos/CommonDTO';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json(
        ErrorResponseFactory.create('UNAUTHORIZED', 'Not authenticated')
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(
        ErrorResponseFactory.create('FORBIDDEN', `Access denied. Required roles: ${allowedRoles.join(', ')}`, {
          requiredRoles: allowedRoles,
          userRole: req.user.role
        })
      );
    }

    next();
  };
};