// src/infrastructure/adapters/http/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { RegisterUserUseCase } from '../../../../application/use-cases/auth/RegisterUserUseCase';
import { prisma } from '../../../../config/prisma';
import { LoginUserUseCase } from '../../../../application/use-cases/auth/LoginUserUseCase';

const router = Router();

// Inyección de dependencias
const userRepository = new PrismaUserRepository(prisma);
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository);
const authController = new AuthController(registerUserUseCase, loginUserUseCase);

// Rutas
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));

export default router;