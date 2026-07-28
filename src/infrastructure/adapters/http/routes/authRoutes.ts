// src/infrastructure/adapters/http/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { RegisterUserUseCase } from '../../../../application/use-cases/auth/RegisterUserUseCase';
import { prisma } from '../../../../config/prisma';
import { LoginUserUseCase } from '../../../../application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../../../../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../../../application/use-cases/auth/LogoutUseCase';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Inyección de dependencias
const userRepository = new PrismaUserRepository(prisma);
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository);
const logoutUseCase = new LogoutUseCase(userRepository);

const authController = new AuthController(
    registerUserUseCase, 
    loginUserUseCase, 
    refreshTokenUseCase,
    logoutUseCase
);

// Rutas publicas
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));

// Rutas protegidas
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));

export default router;