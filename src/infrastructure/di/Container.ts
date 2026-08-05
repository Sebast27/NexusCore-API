import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { ILoginAttemptRepository } from '../../domain/interfaces/repositories/ILoginAttemptRepository';
import { IAuditRepository } from '../../domain/interfaces/repositories/IAuditRepository';
import { ITokenService } from '../../domain/interfaces/services/ITokenService';
import { IDateProvider } from '../../domain/interfaces/IDateProvider';

import { JwtTokenService } from '../services/JwtTokenService';
import { PrismaUserRepository } from '../adapters/database/PrismaUserRepository';
import { PrismaLoginAttemptRepository } from '../adapters/database/PrismaLoginAttemptRepository';
import { PrismaAuditRepository } from '../adapters/database/PrismaAuditRepository';
import { RealDateProvider } from '../adapters/date/RealDateProvider';
import { prisma } from '../adapters/database/prisma';

import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { DeleteUserUseCase } from '../../application/use-cases/users/DeleteUserUseCase';
import { UpdateUserUseCase } from '../../application/use-cases/users/UpdateUserUseCase';
import { GetUsersUseCase } from '../../application/use-cases/users/GetUsersUseCase';
import { GetUserAuditLogUseCase } from '../../application/use-cases/audit/GetUserAuditLogUseCase';
import { GetGlobalAuditLogUseCase } from '../../application/use-cases/audit/GetGlobalAuditLogUseCase';

import { AuthController } from '../adapters/http/controllers/AuthController';
import { UserController } from '../adapters/http/controllers/UserController';
import { AuditController } from '../adapters/http/controllers/AuditController';
import { ConfigError } from '../errors/ConfigError';

/**
 * Contenedor de Dependencias
 * - Registra todas las implementaciones concretas
 * - Gestiona el ciclo de vida de las dependencias
 * - Inyecta dependencias en los casos de uso y controladores
 */
export class Container {
  private static instance: Container;
  private dependencies: Map<string, any> = new Map();
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = prisma;
    this.registerDependencies();
    this.setupShutdownHandlers();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // ============================================
  // REGISTRO DE DEPENDENCIAS
  // ============================================

  private registerDependencies(): void {
    this.registerRepositories();
    this.registerServices();
    this.registerUseCases();
    this.registerControllers();
  }

  private registerRepositories(): void {
    this.dependencies.set('userRepository', new PrismaUserRepository(this.prisma));
    this.dependencies.set('loginAttemptRepository', new PrismaLoginAttemptRepository(this.prisma));
    this.dependencies.set('auditRepository', new PrismaAuditRepository(this.prisma));
    this.dependencies.set('dateProvider', new RealDateProvider());
  }

  private registerServices(): void {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw ConfigError.missingEnvVariable('JWT_SECRET');
    }

    const tokenService = new JwtTokenService(
      jwtSecret,
      process.env.JWT_ACCESS_EXPIRATION || '15m',
      process.env.JWT_REFRESH_EXPIRATION || '7d'
    );
    this.dependencies.set('tokenService', tokenService);
  }

  private registerUseCases(): void {
    const userRepository = this.get<IUserRepository>('userRepository');
    const loginAttemptRepository = this.get<ILoginAttemptRepository>('loginAttemptRepository');
    const auditRepository = this.get<IAuditRepository>('auditRepository');
    const tokenService = this.get<ITokenService>('tokenService');
    const dateProvider = this.get<IDateProvider>('dateProvider');

    // Auth
    this.dependencies.set('registerUserUseCase', new RegisterUserUseCase(userRepository, dateProvider));
    this.dependencies.set('loginUserUseCase', new LoginUserUseCase(userRepository, loginAttemptRepository, tokenService));
    this.dependencies.set('logoutUseCase', new LogoutUseCase(userRepository));
    this.dependencies.set('refreshTokenUseCase', new RefreshTokenUseCase(userRepository, tokenService));

    // Users
    this.dependencies.set('deleteUserUseCase', new DeleteUserUseCase(userRepository, dateProvider));
    this.dependencies.set('updateUserUseCase', new UpdateUserUseCase(userRepository, dateProvider));
    this.dependencies.set('getUsersUseCase', new GetUsersUseCase(userRepository));

    // Audit
    this.dependencies.set('getUserAuditLogUseCase', new GetUserAuditLogUseCase(auditRepository));
    this.dependencies.set('getGlobalAuditLogUseCase', new GetGlobalAuditLogUseCase(auditRepository));
  }

  private registerControllers(): void {
    const registerUserUseCase = this.get<RegisterUserUseCase>('registerUserUseCase');
    const loginUserUseCase = this.get<LoginUserUseCase>('loginUserUseCase');
    const logoutUseCase = this.get<LogoutUseCase>('logoutUseCase');
    const refreshTokenUseCase = this.get<RefreshTokenUseCase>('refreshTokenUseCase');
    const deleteUserUseCase = this.get<DeleteUserUseCase>('deleteUserUseCase');
    const updateUserUseCase = this.get<UpdateUserUseCase>('updateUserUseCase');
    const getUsersUseCase = this.get<GetUsersUseCase>('getUsersUseCase');
    const getUserAuditLogUseCase = this.get<GetUserAuditLogUseCase>('getUserAuditLogUseCase');
    const getGlobalAuditLogUseCase = this.get<GetGlobalAuditLogUseCase>('getGlobalAuditLogUseCase');


    this.dependencies.set('authController', new AuthController(
      registerUserUseCase,
      loginUserUseCase,
      refreshTokenUseCase,
      logoutUseCase
    ));

    this.dependencies.set('userController', new UserController(
      updateUserUseCase,
      deleteUserUseCase,
      getUsersUseCase
    ));

    this.dependencies.set('auditController', new AuditController(
      getUserAuditLogUseCase,
      getGlobalAuditLogUseCase
    ));
  }

  // ============================================
  // CIERRE GRACEFUL (NUEVO)
  // ============================================

  private setupShutdownHandlers(): void {
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
  }

  private async shutdown(signal: string): Promise<void> {
    console.log(`\n🛑 Received ${signal}. Closing dependencies...`);
    try {
      await this.prisma.$disconnect();
      console.log('✅ Database connection closed gracefully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }

  // ============================================
  // MÉTODOS DE OBTENCIÓN
  // ============================================

  get<T>(key: string): T {
    if (!this.dependencies.has(key)) {
      throw new Error(`Dependency "${key}" not found in container`);
    }
    return this.dependencies.get(key) as T;
  }

  getPrisma(): PrismaClient {
    return this.prisma;
  }

  // ============================================
  // OBTENER CASOS DE USO
  // ============================================

  getRegisterUserUseCase(): RegisterUserUseCase {
    return this.get<RegisterUserUseCase>('registerUserUseCase');
  }

  getLoginUserUseCase(): LoginUserUseCase {
    return this.get<LoginUserUseCase>('loginUserUseCase');
  }

  getLogoutUseCase(): LogoutUseCase {
    return this.get<LogoutUseCase>('logoutUseCase');
  }

  getRefreshTokenUseCase(): RefreshTokenUseCase {
    return this.get<RefreshTokenUseCase>('refreshTokenUseCase');
  }

  getDeleteUserUseCase(): DeleteUserUseCase {
    return this.get<DeleteUserUseCase>('deleteUserUseCase');
  }

  getUpdateUserUseCase(): UpdateUserUseCase {
    return this.get<UpdateUserUseCase>('updateUserUseCase');
  }

  getUserAuditLogUseCase(): GetUserAuditLogUseCase {
    return this.get<GetUserAuditLogUseCase>('getUserAuditLogUseCase');
  }

  getGlobalAuditLogUseCase(): GetGlobalAuditLogUseCase {
    return this.get<GetGlobalAuditLogUseCase>('getGlobalAuditLogUseCase');
  }

  // ============================================
  // OBTENER CONTROLADORES
  // ============================================

  getAuthController(): AuthController {
    return this.get<AuthController>('authController');
  }

  getUserController(): UserController {
    return this.get<UserController>('userController');
  }

  getAuditController(): AuditController {
    return this.get<AuditController>('auditController');
  }

  // ============================================
  // MÉTODO PARA TESTING
  // ============================================

  override<T>(key: string, implementation: T): void {
    this.dependencies.set(key, implementation);
  }

  reset(): void {
    this.dependencies.clear();
    this.prisma = new PrismaClient();
    this.registerDependencies();
  }
}