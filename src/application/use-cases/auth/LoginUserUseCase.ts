// application/use-cases/auth/LoginUserUseCase.ts
import { LoginUserInput, LoginUserSchema, LoginUserResponseDTO } from '../../dtos/LoginUserDTO';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { Email } from '../../../domain/value-objects/Email';
import { PlainPassword } from '../../../domain/value-objects/PlainPassword';
import { User } from '../../../domain/entities/User';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import { LoginAttempt } from '../../../domain/entities/LoginAttempt';
import { IpAddress } from '../../../domain/value-objects/IpAddress';
import { ILoginAttemptRepository } from '../../../domain/interfaces/repositories/ILoginAttemptRepository';

export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private loginAttemptRepository: ILoginAttemptRepository,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserResponseDTO> {
    try {
      console.error('🔐 === LOGIN ATTEMPT ===');
      console.error('📧 Email:', input.email);
      console.error('🔑 Password:', input.password);

      const validatedInput = LoginUserSchema.parse(input);
      console.error('✅ Input validado');

      const email = Email.create(validatedInput.email);
      console.error('✅ Email creado');

      const user = await this.userRepository.findByEmail(email);
      console.error('👤 User encontrado?', !!user);
      if (!user) {
        console.error('❌ Usuario NO existe');
        throw new Error('Invalid credentials');
      }

      console.error('👤 ID usuario:', user.getId());
      console.error('🔐 Hashed en BD:', user.getPassword().getValue());

      const plainPassword = PlainPassword.create(validatedInput.password);
      const isPasswordValid = await plainPassword.compare(user.getPassword());
      console.error('✅ ¿Password válida?', isPasswordValid);
      if (!isPasswordValid) {
        console.error('❌ Password inválida');
        throw new Error('Invalid credentials');
      }

      const ipAddress = validatedInput.ipAddress || '0.0.0.0';
      const userAgent = validatedInput.userAgent || 'Unknown';
      
      const userIp = IpAddress.create(ipAddress);
      const successAttempt = LoginAttempt.createSuccessful(
        email,
        userIp,
        user.getId(),
        userAgent,
        {
          ipAddress: ipAddress,
          userAgent: userAgent,
        }
      );
      await this.loginAttemptRepository.save(successAttempt);

      user.loginSuccessful(input.email, {
        ipAddress: ipAddress,
        userAgent: userAgent,
      });
      await this.userRepository.update(user);

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      console.error('🔑 Access Token:', accessToken);
      console.error('🔑 Refresh Token:', refreshToken);

      return {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName().getValue(),
        role: user.getRole(),
        accessToken,
        refreshToken
      };
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('❌ ERROR LOGIN:', error);
        throw error;
      }
      throw error;
    }
  }

  private generateAccessToken(user: User): string {
    const payload = {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      role: user.getRole()
    };

    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const expiresIn = process.env.JWT_ACCESS_EXPIRATION || '15m';

    return jwt.sign(
      payload,
      secret,
      { expiresIn: expiresIn } as jwt.SignOptions
    );
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      role: user.getRole(),
      type: 'refresh' as const
    };

    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const expiresIn = process.env.JWT_REFRESH_EXPIRATION || '7d';

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }
}