import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UpdateUserUseCase } from '../../../../application/use-cases/users/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../../../application/use-cases/users/DeleteUserUseCase';

export class UserController {
  constructor(
    private updateUserUseCase: UpdateUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase
  ) {}

  async getProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Error en getProfile:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getUsers(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      // Solo admin puede ver todos los usuarios
      return res.status(200).json({
        success: true,
        data: {
          message: 'List of all users (admin only)'
        }
      });
    } catch (error) {
      console.error('Error en getUsers:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateUser(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = Array.isArray(id) ? id[0] : id;
      const input = req.body;
      
      const user = await this.updateUserUseCase.execute(userId, input);
      
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      if (error instanceof Error && error.message === 'Name cannot be empty') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      if (error instanceof Error && error.message.includes('Invalid role')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      console.error('Error en updateUser:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = Array.isArray(id) ? id[0] : id;
      await this.deleteUserUseCase.execute(
        userId,
        req.user?.email || 'system',
        'User deleted by administrator'
      );
      
      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      if (error instanceof Error && error.message === 'User is already deleted') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      console.error('Error en deleteUser:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}