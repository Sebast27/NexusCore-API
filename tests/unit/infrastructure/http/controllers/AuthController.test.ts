import { Request, Response } from 'express';
import { AuthController } from '../../../../../src/infrastructure/adapters/http/controllers/AuthController';
import { RegisterUserUseCase } from '../../../../../src/application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../../../src/application/use-cases/auth/LoginUserUseCase';
import { UserAlreadyExistsError } from '../../../../../src/application/errors/UserAlreadyExistsError';
import { RefreshTokenUseCase } from '../../../../../src/application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../../../../src/application/use-cases/auth/LogoutUseCase';
import { AuthRequest } from '../../../../../src/infrastructure/adapters/http/middlewares/authMiddleware';
import { Role } from '../../../../../src/domain/enums/Role';
import { ZodError } from 'zod';

// Mocks
const mockRegisterUseCase = {
  execute: jest.fn()
} as unknown as jest.Mocked<RegisterUserUseCase>;

const mockLoginUseCase = {
  execute: jest.fn()
} as unknown as jest.Mocked<LoginUserUseCase>;

const mockRefreshUseCase = {
  execute: jest.fn()
} as unknown as jest.Mocked<RefreshTokenUseCase>;

const mockLogoutUseCase = {
  execute: jest.fn()
} as unknown as jest.Mocked<LogoutUseCase>;

describe('AuthController', () => {
  let controller: AuthController;
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(
      mockRegisterUseCase, 
      mockLoginUseCase,
      mockRefreshUseCase,
      mockLogoutUseCase
    );
    
    req = {
      body: {},
      user: undefined
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('register', () => {
    it('should return 201 when registration is successful', async () => {
      // Arrange
      const mockInput = {
        email: 'test@test.com',
        password: 'Test123!@#',
        name: 'Test User'
      };
      const mockResult = {
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      req.body = mockInput;
      mockRegisterUseCase.execute.mockResolvedValue(mockResult);

      // Act
      await controller.register(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });

    it('should return 400 when Zod validation fails', async () => {
      // Arrange
      const mockInput = { email: 'invalid', password: '123', name: '' };
      req.body = mockInput;
      
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['email'],
          message: 'Invalid email'
        }
      ]);
      
      mockRegisterUseCase.execute.mockRejectedValue(zodError);

      // Act
      await controller.register(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email'
      });
    });

    it('should return 409 when user already exists', async () => {
      // Arrange
      const mockInput = {
        email: 'test@test.com',
        password: 'Test123!@#',
        name: 'Test User'
      };
      req.body = mockInput;
      
      mockRegisterUseCase.execute.mockRejectedValue(
        new UserAlreadyExistsError('test@test.com')
      );

      // Act
      await controller.register(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'El usuario con email test@test.com ya existe'
      });
    });

    it('should return 500 on unexpected error', async () => {
      // Arrange
      const mockInput = {
        email: 'test@test.com',
        password: 'Test123!@#',
        name: 'Test User'
      };
      req.body = mockInput;
      
      mockRegisterUseCase.execute.mockRejectedValue(new Error('Database error'));

      // Act
      await controller.register(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('login', () => {
    it('should return 200 when login is successful', async () => {
      // Arrange
      const mockInput = {
        email: 'test@test.com',
        password: 'Test123!@#'
      };
      const mockResult = {
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        role: Role.USER,
        accessToken: 'mock-token',
        refreshToken: '7d'
      };
      
      req.body = mockInput;
      mockLoginUseCase.execute.mockResolvedValue(mockResult);

      // Act
      await controller.login(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });

    it('should return 401 on invalid credentials', async () => {
      // Arrange
      const mockInput = {
        email: 'test@test.com',
        password: 'wrong'
      };
      req.body = mockInput;
      
      mockLoginUseCase.execute.mockRejectedValue(
        new Error('Invalid credentials')
      );

      // Act
      await controller.login(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials'
      });
    });

    it('should return 400 on validation error', async () => {
      // Arrange
      const mockInput = { email: 'invalid', password: '123' };
      req.body = mockInput;
      
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['email'],
          message: 'Invalid email'
        }
      ]);
      
      mockLoginUseCase.execute.mockRejectedValue(zodError);

      // Act
      await controller.login(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email'
      });
    });
  });

  // Agregar pruebas de logout
  describe('logout', () => {
    it('should return 200 when logout is successful', async () => {
      // Arrange
      const mockUser = {
        id: '123',
        email: 'test@test.com',
        role: 'USER'
      };
      req.user = mockUser;
      mockLogoutUseCase.execute.mockResolvedValue(undefined);

      // Act
      await controller.logout(req as AuthRequest, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully'
      });
    });

    it('should return 401 if user not authenticated', async () => {
      // Arrange
      req.user = undefined;

      // Act
      await controller.logout(req as AuthRequest, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authenticated'
      });
    });

    it('should return 500 on unexpected error', async () => {
      // Arrange
      const mockUser = {
        id: '123',
        email: 'test@test.com',
        role: 'USER'
      };
      req.user = mockUser;
      mockLogoutUseCase.execute.mockRejectedValue(new Error('Database error'));

      // Act
      await controller.logout(req as AuthRequest, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });
});