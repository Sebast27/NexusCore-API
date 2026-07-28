import { UserAlreadyExistsError } from '../../../../application/errors/UserAlreadyExistsError';
import { RegisterUserInput } from '../../../../application/dtos/RegisterUserDTO';
import { RegisterUserUseCase } from '../../../../application/use-cases/auth/RegisterUserUseCase';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthRequest } from '../middlewares/authMiddleware';
import { LoginUserInput } from '../../../../application/dtos/LoginUserDTO';
import { LoginUserUseCase } from '../../../../application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../../../../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../../../application/use-cases/auth/LogoutUseCase';

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private logoutUseCase: LogoutUseCase
  ) { }

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const input: RegisterUserInput = req.body;
      const result = await this.registerUserUseCase.execute(input);

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      // Error de validación de Zod
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: error.issues[0].message
        });
      }

      // Error: usuario ya existe
      if (error instanceof UserAlreadyExistsError) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      // Error genérico
      console.error('Error en registro:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const input: LoginUserInput = req.body;
      const result = await this.loginUserUseCase.execute(input);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: error.issues[0].message
        });
      }

      if (error instanceof Error && error.message === 'Invalid credentials') {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      console.error('Error en login:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
      }

      const result = await this.refreshTokenUseCase.execute({ refreshToken });
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid refresh token') {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }
      
      if (error instanceof Error && error.message === 'Refresh token expired') {
        return res.status(401).json({
          success: false,
          error: 'Refresh token expired'
        });
      }

      console.error('Error en refresh:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      await this.logoutUseCase.execute({ userId: req.user.id });
      
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Error en logout:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}