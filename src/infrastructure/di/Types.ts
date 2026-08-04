import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { ILoginAttemptRepository } from '../../domain/interfaces/repositories/ILoginAttemptRepository';
import { IAuditRepository } from '../../domain/interfaces/repositories/IAuditRepository';
import { ITokenService } from '../../domain/interfaces/services/ITokenService';
import { IDateProvider } from '../../domain/interfaces/IDateProvider';

import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { DeleteUserUseCase } from '../../application/use-cases/users/DeleteUserUseCase';
import { UpdateUserUseCase } from '../../application/use-cases/users/UpdateUserUseCase';
import { GetUserAuditLogUseCase } from '../../application/use-cases/audit/GetUserAuditLogUseCase';
import { GetGlobalAuditLogUseCase } from '../../application/use-cases/audit/GetGlobalAuditLogUseCase';

/**
 * Tipos de dependencias del contenedor
 * Usado para type-safety al obtener dependencias
 */
export interface ContainerTypes {
  // Repositorios
  userRepository: IUserRepository;
  loginAttemptRepository: ILoginAttemptRepository;
  auditRepository: IAuditRepository;

  // Servicios
  tokenService: ITokenService;
  dateProvider: IDateProvider;

  // Casos de uso - Auth
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  logoutUseCase: LogoutUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;

  // Casos de uso - Users
  deleteUserUseCase: DeleteUserUseCase;
  updateUserUseCase: UpdateUserUseCase;

  // Casos de uso - Audit
  getUserAuditLogUseCase: GetUserAuditLogUseCase;
  getGlobalAuditLogUseCase: GetGlobalAuditLogUseCase;
}