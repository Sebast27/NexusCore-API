import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UpdateUserUseCase } from '../../../../application/use-cases/users/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../../../application/use-cases/users/DeleteUserUseCase';
import { ErrorResponseFactory } from '../../../../application/dtos/CommonDTO';
import { UserNotFoundError } from '../../../../domain/errors/UserNotFoundError';
import { ValidationError } from '../../../../application/errors/ValidationError';
import { UserAlreadyDeletedError } from '../../../../domain/errors/UserAlreadyDeletedError';
import { UpdateUserRequestDTO } from '../../../../application/dtos/UpdateUserDTO';
import { DeleteUserRequestDTO } from '../../../../application/dtos/DeleteUserDTO';
import { GetUsersUseCase } from '../../../../application/use-cases/users/GetUsersUseCase';

export class UserController {
  constructor(
    private updateUserUseCase: UpdateUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
    private getUsersUseCase: GetUsersUseCase
  ) {}

  async getProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json(
          ErrorResponseFactory.create('UNAUTHORIZED', 'Not authenticated')
        );
      }

      return res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      return res.status(500).json(
        ErrorResponseFactory.create('INTERNAL_ERROR', 'Internal server error')
      );
    }
  }

  async getUsers(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json(
          ErrorResponseFactory.create('UNAUTHORIZED', 'Not authenticated')
        );
      }

      // Traer usuarios
      const users = await this.getUsersUseCase.execute();

      // Solo admin puede ver todos los usuarios
      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      return res.status(500).json(
        ErrorResponseFactory.create('INTERNAL_ERROR', 'Internal server error')
      );
    }
  }

  async updateUser(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = Array.isArray(id) ? id[0] : id;
      const input = req.body;

      const updateInput: UpdateUserRequestDTO = {
        userId,
        ...input,
        updatedBy: req.user?.email || 'system',
      };
      
      const user = await this.updateUserUseCase.execute(updateInput);
      
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json(
          ErrorResponseFactory.create('USER_NOT_FOUND', error.message)
        );
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json(
          ErrorResponseFactory.create('VALIDATION_ERROR', error.message, error.metadata)
        );
      }
      
      return res.status(500).json(
        ErrorResponseFactory.create('INTERNAL_ERROR', 'Internal server error')
      );
    }
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = Array.isArray(id) ? id[0] : id;

      const deleteInput: DeleteUserRequestDTO = {
        userId,
        deletedBy: req.user?.email || 'system',
        reason: 'User deleted by administrator'
      };
      
      await this.deleteUserUseCase.execute(deleteInput);
      
      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json(
          ErrorResponseFactory.create('USER_NOT_FOUND', error.message)
        );
      }
      
      if (error instanceof UserAlreadyDeletedError) {
        return res.status(400).json(
          ErrorResponseFactory.create('USER_ALREADY_DELETED', error.message)
        );
      }
      
      return res.status(500).json(
        ErrorResponseFactory.create('INTERNAL_ERROR', 'Internal server error')
      );
    }
  }
}