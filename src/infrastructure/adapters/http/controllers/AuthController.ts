import { RegisterUserInput } from '../../../../application/dtos/RegisterUserDTO';
import { RegisterUserUseCase } from '../../../../application/use-cases/auth/RegisterUserUseCase';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthRequest } from '../middlewares/authMiddleware';
import { LoginUserRequestDTO } from '../../../../application/dtos/LoginUserDTO';
import { LoginUserUseCase } from '../../../../application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../../../../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../../../application/use-cases/auth/LogoutUseCase';
import { ErrorResponseFactory } from '../../../../application/dtos/CommonDTO';
import { InvalidCredentialsError } from '../../../../domain/errors/InvalidCredentialsError';
import { UserNotFoundError } from '../../../../domain/errors/UserNotFoundError';
import { TokenExpiredError } from '../../../../domain/errors/auth/TokenExpiredError';
import { InvalidTokenError } from '../../../../domain/errors/auth/InvalidTokenError';
import { EmailAlreadyExistsError } from '../../../../domain/errors/EmailAlreadyExistsError';

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
        return res.status(400).json(
          ErrorResponseFactory.create('VALIDATION_ERROR', error.issues[0].message, {
            field: error.issues[0].path.join('.')
          })
        );
      }

      // Error: usuario ya existe
      if (error instanceof EmailAlreadyExistsError) {
        return res.status(409).json(
          ErrorResponseFactory.create('EMAIL_ALREADY_EXISTS', error.message)
        );
      }

      // Error genérico
      return res.status(500).json(
        ErrorResponseFactory.create('INTERNAL_ERROR', 'Internal server error')
      );
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const input: LoginUserRequestDTO = req.body;
      const result = await this.loginUserUseCase.execute(input);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(
          ErrorResponseFactory.create('VALIDATION_ERROR', error.issues[0].message, {
            field: error.issues[0].path.join('.')
          })
        );
      }

      if (error instanceof InvalidCredentialsError) {
        return res.status(401).json(
          ErrorResponseFactory.create('INVALID_CREDENTIALS', error.message)
        );
      }

      if (error instanceof UserNotFoundError) {
        return res.status(404).json(
          ErrorResponseFactory.create('USER_NOT_FOUND', error.message)
        );
      }

      return res.status(500).json(
        ErrorResponseFactory.create('INTERNAL_ERROR', 'Internal server error')
      );
    }
  }

  async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json(
          ErrorResponseFactory.create('REFRESH_TOKEN_REQUIRED', 'Refresh token is required')
        );
      }

      const result = await this.refreshTokenUseCase.execute({ refreshToken });
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return res.status(401).json(
          ErrorResponseFactory.create('REFRESH_TOKEN_EXPIRED', 'Refresh token expired')
        );
      }
      
      if (error instanceof InvalidTokenError) {
        return res.status(401).json(
          ErrorResponseFactory.create('INVALID_TOKEN', 'Invalid refresh token')
        );
      }

      return res.status(500).json(
        ErrorResponseFactory.create('INTERNAL_ERROR', 'Internal server error')
      );
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json(
          ErrorResponseFactory.create('UNAUTHORIZED', 'Not authenticated')
        );
      }

      await this.logoutUseCase.execute({ userId: req.user.id });
      
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      return res.status(500).json(
        ErrorResponseFactory.create('INTERNAL_ERROR', 'Internal server error')
      );
    }
  }
}