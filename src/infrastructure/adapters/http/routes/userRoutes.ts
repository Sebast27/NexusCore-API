import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { UpdateUserUseCase } from '../../../../application/use-cases/users/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../../../application/use-cases/users/DeleteUserUseCase';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { prisma } from '../../../../config/prisma';

const router = Router();

const userRepository = new PrismaUserRepository(prisma);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const userController = new UserController(updateUserUseCase, deleteUserUseCase);

// Rutas protegidas
router.get('/profile', authMiddleware, (req, res) => userController.getProfile(req, res));
router.get('/users', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => userController.getUsers(req, res));
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => userController.updateUser(req, res));
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => userController.deleteUser(req, res));

export default router;