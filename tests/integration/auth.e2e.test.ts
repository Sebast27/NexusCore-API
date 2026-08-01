import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../../src/infrastructure/adapters/http/routes/authRoutes';
import userRoutes from '../../src/infrastructure/adapters/http/routes/userRoutes';
import { prisma } from '../../src/config/prisma';

describe('Auth E2E Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
  });

   afterAll(async () => {
    // Desconectar Prisma después de todas las pruebas
    await prisma.$disconnect();
  });

    beforeEach(async () => {
      // Limpiar la base de datos antes de cada prueba
      await prisma.user.deleteMany();
    });


  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {

  const userData = {
    email: 'test@test.com',
    password: 'Test123!@#',
    name: 'Test'
  };

  const response = await request(app)
    .post('/api/auth/register')
    .send(userData)
    .expect(201);

  // Assert

  // ✅ Imprimir SIEMPRE
  console.log('📦 Status:', response.status);
  console.log('📦 Body:', JSON.stringify(response.body, null, 2));

  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
  expect(response.body.data.email).toBe(userData.email);
});

    it('should return 409 if email already exists', async () => {
      // Arrange
      const userData = {
        email: 'test@test.com',
        password: 'Test123!@#',
        name: 'Test User'
      };

      // Crear usuario primero
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('ya existe');
    });

    it('should return 400 if email is invalid', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        password: 'Test123!@#',
        name: 'Test User'
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email format');
    });

    it('should return 400 if password is weak', async () => {
      // Arrange
      const userData = {
        email: 'test@test.com',
        password: '123',
        name: 'Test User'
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Password must be at least 8 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Registrar un usuario para login
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@test.com',
          password: 'Login123!@#',
          name: 'Login Test'
        });
    });

    it('should login successfully and return token', async () => {
      // Arrange
      const credentials = {
        email: 'login@test.com',
        password: 'Login123!@#'
      };

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        email: credentials.email,
        name: 'Login Test',
        role: 'USER'
      });
      expect(response.body.data.accessToken).toBeDefined();
      expect(typeof response.body.data.accessToken).toBe('string');
    });

    it('should return 401 if credentials are invalid', async () => {
      // Arrange
      const credentials = {
        email: 'login@test.com',
        password: 'WrongPassword123!'
      };

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 400 if email is missing', async () => {
      // Arrange
      const credentials = {
        password: 'Login123!@#'
      };

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(['Email is required', 'Invalid input: expected string, received undefined']).toContain(response.body.error);
    });
  });

  describe('GET /api/users/profile', () => {
    let token: string;

    beforeEach(async () => {
      // Registrar y loguear usuario
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'profile@test.com',
          password: 'Profile123!@#',
          name: 'Profile Test'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profile@test.com',
          password: 'Profile123!@#'
        });

      token = loginResponse.body.data.accessToken;
    });

    it('should return user profile with valid token', async () => {
      // Act
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        id: expect.any(String),
        email: 'profile@test.com',
        role: 'USER'
      });
    });

    it('should return 401 if no token provided', async () => {
      // Act
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No token provided');
    });

    it('should return 401 if invalid token', async () => {
      // Act
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('GET /api/users/users', () => {
    let userToken: string;

    beforeEach(async () => {
      // Crear usuario normal
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'normal@test.com',
          password: 'Normal123!@#',
          name: 'Normal User'
        });

      const userLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'normal@test.com',
          password: 'Normal123!@#'
        });
      userToken = userLogin.body.data.accessToken;

      // Crear usuario admin (necesitamos crearlo manualmente en BD por ahora)
      // Nota: En una aplicación real, tendrías un seed o endpoint para crear admin
      // Para esta prueba, como no tenemos endpoint para crear admin, 
      // este test debería fallar o necesitar un admin existente
    });

    it('should return 403 if user is not admin', async () => {
      // Act
      const response = await request(app)
        .get('/api/users/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied. Required roles: ADMIN');
    });

    it('should return 401 if no token provided', async () => {
      // Act
      const response = await request(app)
        .get('/api/users/users')
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No token provided');
    });
  });
});