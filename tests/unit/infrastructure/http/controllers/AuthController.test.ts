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
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(
      mockRegisterUseCase, 
      mockLoginUseCase,
      mockRefreshUseCase,
      mockLogoutUseCase
    );

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    req = {
      body: {},
      user: undefined
    };
    
    res = {
      status: statusMock,
      json: jsonMock
    };
  });

  describe('register', () => {
    it('should return 201 when registration is successful', async () => {
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

      await controller.register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });

    it('should return 400 when Zod validation fails', async () => {
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

      await controller.register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email'
      });
    });

    it('should return 409 when user already exists', async () => {
      const mockInput = {
        email: 'test@test.com',
        password: 'Test123!@#',
        name: 'Test User'
      };
      req.body = mockInput;
      
      mockRegisterUseCase.execute.mockRejectedValue(
        new UserAlreadyExistsError('test@test.com')
      );

      await controller.register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'El usuario con email test@test.com ya existe'
      });
    });

    it('should return 500 on unexpected error', async () => {
      const mockInput = {
        email: 'test@test.com',
        password: 'Test123!@#',
        name: 'Test User'
      };
      req.body = mockInput;
      
      mockRegisterUseCase.execute.mockRejectedValue(new Error('Database error'));

      await controller.register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('login', () => {
    it('should return 200 when login is successful', async () => {
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

      await controller.login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });

    it('should return 401 on invalid credentials', async () => {
      const mockInput = {
        email: 'test@test.com',
        password: 'wrong'
      };
      req.body = mockInput;
      
      mockLoginUseCase.execute.mockRejectedValue(
        new Error('Invalid credentials')
      );

      await controller.login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials'
      });
    });

    it('should return 400 on validation error', async () => {
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

      await controller.login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email'
      });
    });
  });

  describe('logout', () => {
    it('should return 200 when logout is successful', async () => {
      const mockUser = {
        id: '123',
        email: 'test@test.com',
        role: 'USER'
      };
      req.user = mockUser;
      mockLogoutUseCase.execute.mockResolvedValue(undefined);

      await controller.logout(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully'
      });
    });

    it('should return 401 if user not authenticated', async () => {
      req.user = undefined;

      await controller.logout(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Not authenticated'
      });
    });

    it('should return 500 on unexpected error', async () => {
      const mockUser = {
        id: '123',
        email: 'test@test.com',
        role: 'USER'
      };
      req.user = mockUser;
      mockLogoutUseCase.execute.mockRejectedValue(new Error('Database error'));

      await controller.logout(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  // ✅ Tests de error corregidos - usando statusMock y jsonMock
  describe('Error handling', () => {
    it('should handle registration error', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const mockError = new Error('Database error');
      mockRegisterUseCase.execute.mockRejectedValue(mockError);

      req.body = registerData;

      await controller.register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
      });
    });

    it('should handle login error', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const mockError = new Error('Invalid credentials');
      mockLoginUseCase.execute.mockRejectedValue(mockError);

      req.body = loginData;

      await controller.login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials',
      });
    });

    it('should handle Zod validation error on register', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        name: 'T',
      };

      const zodError = new ZodError([
        { code: 'invalid_type', expected: 'string', path: ['email'], message: 'Invalid email' }
      ]);
      mockRegisterUseCase.execute.mockRejectedValue(zodError);

      req.body = invalidData;

      await controller.register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email',
      });
    });
  });
});