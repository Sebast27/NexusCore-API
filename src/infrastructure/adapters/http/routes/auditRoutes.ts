import { Router } from 'express';
import { Container } from '../../../di/Container';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

// Obtener todo del container
const container = Container.getInstance();
const auditController = container.getAuditController();

router.get(
  '/user/:userId',
  authMiddleware,
  (req, res) => auditController.getUserAuditLogs(req, res)
);

router.get(
  '/global',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  (req, res) => auditController.getGlobalAuditLogs(req, res)
);

export default router;

/**
 * @swagger
 * /api/audit/user/{userId}:
 *   get:
 *     summary: Obtener logs de auditoría de un usuario específico
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de logs de auditoría
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
 *                         $ref: '#/components/schemas/AuditLogResponse'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/audit/global:
 *   get:
 *     summary: Obtener logs de auditoría globales (solo ADMIN)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventName
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de evento
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio (ISO)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin (ISO)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Lista de logs de auditoría
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuditLogPaginatedResponse'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       500:
 *         description: Error interno del servidor
 */