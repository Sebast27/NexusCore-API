import 'dotenv/config';
import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from './infrastructure/config/swagger';
import { Container } from './infrastructure/di/Container';
import { authMiddleware } from './infrastructure/adapters/http/middlewares/authMiddleware';
import { roleMiddleware } from './infrastructure/adapters/http/middlewares/roleMiddleware';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 1. OBTENER CONTROLADORES DEL CONTAINER
// ============================================

const container = Container.getInstance();
const authController = container.getAuthController();
const userController = container.getUserController();
const auditController = container.getAuditController();

// ============================================
// 2. MIDDLEWARES
// ============================================

app.use(express.json());

// ============================================
// 3. RUTAS
// ============================================

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'NexusCore-API'
  });
});

// Ruta raíz
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to NexusCore-API',
    documentation: '/api-docs',
    health: '/health',
    auth: '/api/auth',
    users: '/api/users'
  });
});

// ============================================
// 4. RUTAS DE AUTENTICACIÓN
// ============================================

app.post('/api/auth/register', authController.register.bind(authController));
app.post('/api/auth/login', authController.login.bind(authController));
app.post('/api/auth/refresh', authController.refresh.bind(authController));
app.post('/api/auth/logout', authMiddleware, authController.logout.bind(authController)); 

// ============================================
// 5. RUTAS DE USUARIOS (CON MIDDLEWARES)
// ============================================

// ✅ Todas con authMiddleware
app.get('/api/users/profile', authMiddleware, userController.getProfile.bind(userController));
app.get('/api/users', authMiddleware, roleMiddleware(['ADMIN']), userController.getUsers.bind(userController));
app.put('/api/users/:id', authMiddleware, roleMiddleware(['ADMIN']), userController.updateUser.bind(userController));
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['ADMIN']), userController.deleteUser.bind(userController));

// ============================================
// 6. RUTAS DE AUDITORÍA (CON MIDDLEWARES)
// ============================================

app.get('/api/audit/user/:userId', authMiddleware, auditController.getUserAuditLogs.bind(auditController));
app.get('/api/audit/global', authMiddleware, roleMiddleware(['ADMIN']), auditController.getGlobalAuditLogs.bind(auditController));

// ============================================
// 7. MIDDLEWARE DE ERRORES
// ============================================

app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
    },
  });
});

// ============================================
// 8. INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`👤 Users: http://localhost:${PORT}/api/users`);
  console.log(`📊 Audit: http://localhost:${PORT}/api/audit`);
});