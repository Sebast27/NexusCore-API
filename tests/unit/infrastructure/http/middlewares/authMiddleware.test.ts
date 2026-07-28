import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest } from '../../../../../src/infrastructure/adapters/http/middlewares/authMiddleware';

// Mock de jwt
jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no token provided', () => {
    // Act
    authMiddleware(req as AuthRequest, res as Response, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'No token provided'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if invalid token format', () => {
    // Arrange
    req.headers = {
      authorization: 'InvalidFormat'
    };

    // Act
    authMiddleware(req as AuthRequest, res as Response, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token format. Use: Bearer <token>'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if invalid token', () => {
    // Arrange
    req.headers = {
      authorization: 'Bearer invalid-token'
    };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.JsonWebTokenError('Invalid token');
    });

    // Act
    authMiddleware(req as AuthRequest, res as Response, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token expired', () => {
    // Arrange
    req.headers = {
      authorization: 'Bearer expired-token'
    };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.TokenExpiredError('Token expired', new Date());
    });

    // Act
    authMiddleware(req as AuthRequest, res as Response, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token expired'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach user to request if valid token', () => {
    // Arrange
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      role: 'USER'
    };
    req.headers = {
      authorization: 'Bearer valid-token'
    };
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);

    // Act
    authMiddleware(req as AuthRequest, res as Response, next);

    // Assert
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});