import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';

export class UserController {
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
}