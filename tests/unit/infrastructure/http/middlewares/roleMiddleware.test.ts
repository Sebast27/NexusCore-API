import { Response, NextFunction } from 'express';
import { roleMiddleware } from '../../../../../src/infrastructure/adapters/http/middlewares/roleMiddleware';
import { AuthRequest } from '../../../../../src/infrastructure/adapters/http/middlewares/authMiddleware';

describe('roleMiddleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      user: undefined
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if user not authenticated', () => {
    // Arrange
    const middleware = roleMiddleware(['ADMIN']);

    // Act
    middleware(req as AuthRequest, res as Response, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Not authenticated'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user role not allowed', () => {
    // Arrange
    req.user = {
      id: '123',
      email: 'test@test.com',
      role: 'USER'
    };
    const middleware = roleMiddleware(['ADMIN']);

    // Act
    middleware(req as AuthRequest, res as Response, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Access denied. Required roles: ADMIN'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user role is allowed', () => {
    // Arrange
    req.user = {
      id: '123',
      email: 'admin@test.com',
      role: 'ADMIN'
    };
    const middleware = roleMiddleware(['ADMIN']);

    // Act
    middleware(req as AuthRequest, res as Response, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should allow multiple roles', () => {
    // Arrange
    req.user = {
      id: '123',
      email: 'editor@test.com',
      role: 'EDITOR'
    };
    const middleware = roleMiddleware(['ADMIN', 'EDITOR']);

    // Act
    middleware(req as AuthRequest, res as Response, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});