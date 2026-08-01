import { Response } from 'express';
import { UserController } from '../../../../../src/infrastructure/adapters/http/controllers/UserController';
import { AuthRequest } from '../../../../../src/infrastructure/adapters/http/middlewares/authMiddleware';

// Mocks de UseCases
const mockUpdateUserUseCase = {
  execute: jest.fn()
};

const mockDeleteUserUseCase = {
  execute: jest.fn()
};

describe('UserController', () => {
  let controller: UserController;
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UserController(
      mockUpdateUserUseCase as any,
      mockDeleteUserUseCase as any
    );
    
    req = {
      user: undefined,
      params: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getProfile', () => {
    it('should return 200 with user profile when authenticated', async () => {
      const mockUser = {
        id: '123',
        email: 'test@test.com',
        role: 'USER'
      };
      req.user = mockUser;

      await controller.getProfile(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser }
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      req.user = undefined;

      await controller.getProfile(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authenticated'
      });
    });

    // ❌ ELIMINADO: El método getProfile no puede lanzar error
    // it('should return 500 on error', ...)
  });

  describe('getUsers', () => {
    it('should return 200 with users list when admin', async () => {
      req.user = {
        id: '123',
        email: 'admin@test.com',
        role: 'ADMIN'
      };

      await controller.getUsers(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'List of all users (admin only)'
        }
      });
    });

    it('should return 401 if user not authenticated', async () => {
      req.user = undefined;

      await controller.getUsers(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authenticated'
      });
    });

    // ❌ ELIMINADO: El método getUsers no puede lanzar error
    // it('should return 500 on error', ...)
  });

  describe('updateUser', () => {
    it('should return 200 when user updated successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@test.com',
        name: 'Updated Name',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      req.params = { id: '123' };
      req.body = { name: 'Updated Name' };
      req.user = { id: '456', email: 'admin@test.com', role: 'ADMIN' };
      
      mockUpdateUserUseCase.execute.mockResolvedValue(mockUser);

      await controller.updateUser(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    it('should return 404 if user not found', async () => {
      req.params = { id: '123' };
      req.body = { name: 'Updated Name' };
      req.user = { id: '456', email: 'admin@test.com', role: 'ADMIN' };
      
      mockUpdateUserUseCase.execute.mockRejectedValue(new Error('User not found'));

      await controller.updateUser(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should return 400 if name is empty', async () => {
      req.params = { id: '123' };
      req.body = { name: '' };
      req.user = { id: '456', email: 'admin@test.com', role: 'ADMIN' };
      
      mockUpdateUserUseCase.execute.mockRejectedValue(new Error('Name cannot be empty'));

      await controller.updateUser(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Name cannot be empty'
      });
    });

    it('should return 400 if role is invalid', async () => {
      req.params = { id: '123' };
      req.body = { role: 'INVALID' };
      req.user = { id: '456', email: 'admin@test.com', role: 'ADMIN' };
      
      mockUpdateUserUseCase.execute.mockRejectedValue(new Error('Invalid role: INVALID'));

      await controller.updateUser(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid role: INVALID'
      });
    });

    it('should return 500 on error', async () => {
      req.params = { id: '123' };
      req.user = { id: '456', email: 'admin@test.com', role: 'ADMIN' };
      
      mockUpdateUserUseCase.execute.mockRejectedValue(new Error('Database error'));

      await controller.updateUser(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('deleteUser', () => {
    it('should return 200 when user deleted successfully', async () => {
      req.params = { id: '123' };
      req.user = { id: '456', email: 'admin@test.com', role: 'ADMIN' };
      
      mockDeleteUserUseCase.execute.mockResolvedValue(undefined);

      await controller.deleteUser(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User deleted successfully'
      });
    });

    it('should return 404 if user not found', async () => {
      req.params = { id: '123' };
      req.user = { id: '456', email: 'admin@test.com', role: 'ADMIN' };
      
      mockDeleteUserUseCase.execute.mockRejectedValue(new Error('User not found'));

      await controller.deleteUser(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should return 400 if user already deleted', async () => {
      req.params = { id: '123' };
      req.user = { id: '456', email: 'admin@test.com', role: 'ADMIN' };
      
      mockDeleteUserUseCase.execute.mockRejectedValue(new Error('User is already deleted'));

      await controller.deleteUser(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User is already deleted'
      });
    });

    it('should return 500 on error', async () => {
      req.params = { id: '123' };
      req.user = { id: '456', email: 'admin@test.com', role: 'ADMIN' };
      
      mockDeleteUserUseCase.execute.mockRejectedValue(new Error('Database error'));

      await controller.deleteUser(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });
});