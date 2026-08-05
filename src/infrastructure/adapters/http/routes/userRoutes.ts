import { Router } from 'express';
import { Container } from '../../../di/Container';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

// Obtener todo del container
const container = Container.getInstance();
const userController = container.getUserController();

router.get('/profile', authMiddleware, (req, res) => userController.getProfile(req, res));
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => userController.getUsers(req, res));
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => userController.updateUser(req, res));
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => userController.deleteUser(req, res));

export default router;

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             email:
 *                               type: string
 *                             role:
 *                               type: string
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos los usuarios (solo ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario (solo ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario (solo ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User deleted successfully
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */