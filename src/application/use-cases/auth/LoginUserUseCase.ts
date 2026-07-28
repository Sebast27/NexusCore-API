import { LoginUserInput, LoginUserSchema, LoginUserResponseDTO } from '../../dtos/LoginUserDTO';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { User } from '../../../domain/entities/User';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';

export class LoginUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: LoginUserInput): Promise<LoginUserResponseDTO> {
    try {

      console.error('🔐 === LOGIN ATTEMPT ===');
    console.error('📧 Email:', input.email);
    console.error('🔑 Password:', input.password);

      // 1. Validar entrada con Zod
      const validatedInput = LoginUserSchema.parse(input);
      console.error('✅ Input validado');

      // 2. Crear Value Objects
      const email = Email.create(validatedInput.email);
      console.error('✅ Email creado');

      // 3. Buscar usuario por email
      const user = await this.userRepository.findByEmail(email);
      console.error('👤 User encontrado?', !!user);
      if (!user) {
        console.error('❌ Usuario NO existe');
        throw new Error('Invalid credentials');
      }

      console.error('👤 ID usuario:', user.getId());
    console.error('🔐 Hashed en BD:', user.getPassword().getValue());
      

      // 4. Verificar contraseña
      const isPasswordValid = await Password.compare(validatedInput.password, user.getPassword().getValue());
      console.error('✅ ¿Password válida?', isPasswordValid);
      if (!isPasswordValid) {
        console.error('❌ Password inválida');
        throw new Error('Invalid credentials');
      }

      // 5. Generar JWT
      const token = this.generateToken(user);
      console.error('✅ Token generado');

      // 6. Retornar respuesta
      return {
        id: user.getId(),
        email: user.getEmail().getValue(),
        name: user.getName(),
        role: user.getRole(),
        accessToken: token,
        refreshToken: this.generateRefreshToken(user)
      };
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('❌ ERROR LOGIN:', error);
        throw error;
      }
      throw error;
    }
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.getId(),
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
      id: user.getId(),
      email: user.getEmail().getValue(),
      role: user.getRole(),
      type: 'refresh' as const
    };

    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const expiresIn = process.env.JWT_REFRESH_EXPIRATION || '7d';

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }
}