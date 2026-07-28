import { UserAlreadyExistsError } from '../../../../application/errors/UserAlreadyExistsError';
import { RegisterUserInput } from '../../../../application/dtos/RegisterUserDTO';
import { RegisterUserUseCase } from '../../../../application/use-cases/auth/RegisterUserUseCase';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { LoginUserInput } from '../../../../application/dtos/LoginUserDTO';
import { LoginUserUseCase } from '../../../../application/use-cases/auth/LoginUserUseCase';

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase) { }

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
}