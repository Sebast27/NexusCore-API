// src/server.ts
import 'dotenv/config'; 
import express, { Request, Response } from 'express';
import authRoutes from './infrastructure/adapters/http/routes/authRoutes';
import userRoutes from './infrastructure/adapters/http/routes/userRoutes'; // 👈 Agregar

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // 👈 Agregar rutas de usuarios

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
    health: '/health'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/login`);
  console.log(`👤 Users: http://localhost:${PORT}/api/users/profile`);
});