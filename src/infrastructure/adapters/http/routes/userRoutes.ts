import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();
const userController = new UserController();

// Rutas protegidas
router.get('/profile', authMiddleware, (req, res) => userController.getProfile(req, res));
router.get('/users', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => userController.getUsers(req, res));

export default router;