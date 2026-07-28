import { Response } from 'express';
import { UserController } from '../../../../../src/infrastructure/adapters/http/controllers/UserController';
import { AuthRequest } from '../../../../../src/infrastructure/adapters/http/middlewares/authMiddleware';

describe('UserController', () => {
  let controller: UserController;
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UserController();
    
    req = {
      user: undefined
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getProfile', () => {
    it('should return 200 with user profile when authenticated', async () => {
      // Arrange
      const mockUser = {
        id: '123',
        email: 'test@test.com',
        role: 'USER'
      };
      req.user = mockUser;

      // Act
      await controller.getProfile(req as AuthRequest, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser
        }
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      req.user = undefined;

      // Act
      await controller.getProfile(req as AuthRequest, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authenticated'
      });
    });
  });

  describe('getUsers', () => {
    it('should return 200 with users list when admin', async () => {
      // Arrange
      const mockUser = {
        id: '123',
        email: 'admin@test.com',
        role: 'ADMIN'
      };
      req.user = mockUser;

      // Act
      await controller.getUsers(req as AuthRequest, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'List of all users (admin only)'
        }
      });
    });

    it('should return 401 if user not authenticated', async () => {
      // Arrange
      req.user = undefined;

      // Act
      await controller.getUsers(req as AuthRequest, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authenticated'
      });
    });
  });
});