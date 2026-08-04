import { LoginUserRequestDTO, LoginUserSchema, LoginUserResponseDTO } from '../../dtos/LoginUserDTO';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { Email } from '../../../domain/value-objects/Email';
import { PlainPassword } from '../../../domain/value-objects/PlainPassword';
import { LoginAttempt } from '../../../domain/entities/LoginAttempt';
import { IpAddress } from '../../../domain/value-objects/IpAddress';
import { ILoginAttemptRepository } from '../../../domain/interfaces/repositories/ILoginAttemptRepository';
import { InvalidCredentialsError } from '../../../domain/errors/InvalidCredentialsError';
import { UserLoginBlockedError } from '../../../domain/errors/UserLoginBlockedError';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';

export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private loginAttemptRepository: ILoginAttemptRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(input: LoginUserRequestDTO): Promise<LoginUserResponseDTO> {
      // 1. Validar entrada con Zod
      const validatedInput = LoginUserSchema.parse(input);

      // 2. Crear Value Objects
      const email = Email.create(validatedInput.email);
      const plainPassword = PlainPassword.createForComparison(validatedInput.password);

      // 3. Buscar usuario
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        await this.recordFailedAttempt(email, validatedInput, 'User not found');
        throw new InvalidCredentialsError();
      }

      // 4. Verificar si el usuario está bloqueado para login
      if (user.isDeleted()) {
        throw new UserLoginBlockedError(
          email.getValue(),
          'User account is deleted'
        );
      }


      // 5. Validar password
      const isPasswordValid = await plainPassword.compare(user.getPassword());
      if (!isPasswordValid) {
        await this.recordFailedAttempt(email, validatedInput, 'Invalid password');
        throw new InvalidCredentialsError();
      }

      // 6. Registrar intento exitoso
      const ipAddress = validatedInput.ipAddress || '0.0.0.0';
      const userAgent = validatedInput.userAgent || 'Unknown';
      
      const userIp = IpAddress.create(ipAddress);
      const successAttempt = LoginAttempt.createSuccessful(
        email,
        userIp,
        user.getId(),
        {
          userAgent: userAgent,
          correlationId: validatedInput.correlationId,
        }
      );
      await this.loginAttemptRepository.save(successAttempt);

      // 7. Registrar evento de login exitoso en el usuario
      user.loginSuccessful({
        ipAddress: ipAddress,
        userAgent: userAgent,
        correlationId: validatedInput.correlationId,
      });
      await this.userRepository.update(user);

      // 8. Generar tokens usando el servicio
      const tokens = this.tokenService.generateTokens(user);

      return {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName().getValue(),
        role: user.getRole(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        tokenType: tokens.tokenType,
      };
  }

  private async recordFailedAttempt(
    email: Email,
    input: LoginUserRequestDTO,
    reason: string
  ): Promise<void> {
    const ipAddress = input.ipAddress || '0.0.0.0';
    const userAgent = input.userAgent || 'Unknown';
    
    const userIp = IpAddress.create(ipAddress);
    const failedAttempt = LoginAttempt.createFailed(
      email,
      userIp,
      reason,
      undefined,
      {
        userAgent: userAgent,
        correlationId: input.correlationId,
      }
    );
    await this.loginAttemptRepository.save(failedAttempt);
  }
}