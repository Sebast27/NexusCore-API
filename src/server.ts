import 'dotenv/config';
import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './infrastructure/adapters/http/routes/authRoutes';
import userRoutes from './infrastructure/adapters/http/routes/userRoutes';
import { specs } from './infrastructure/config/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`👤 Users: http://localhost:${PORT}/api/users`);
});