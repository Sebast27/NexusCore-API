import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { PrismaLoginAttemptRepository } from '../../database/PrismaLoginAttemptRepository';
import { AuthController } from '../controllers/AuthController';
import { RegisterUserUseCase } from '../../../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../../application/use-cases/auth/LoginUserUseCase';
import { LogoutUseCase } from '../../../../application/use-cases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '../../../../application/use-cases/auth/RefreshTokenUseCase';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RealDateProvider } from '../../date/RealDateProvider';

const router = Router();

// Crear instancias de dependencias
const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const loginAttemptRepository = new PrismaLoginAttemptRepository(prisma);
const dateProvider = new RealDateProvider();

// Pasar todas las dependencias
const registerUserUseCase = new RegisterUserUseCase(userRepository, dateProvider);
const loginUserUseCase = new LoginUserUseCase(userRepository, loginAttemptRepository);
const logoutUseCase = new LogoutUseCase(userRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository);

const authController = new AuthController(
  registerUserUseCase,
  loginUserUseCase,
  refreshTokenUseCase,
  logoutUseCase
);

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));

export default router;