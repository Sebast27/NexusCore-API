import { RegisterUserInput, RegisterUserSchema } from '../../dtos/RegisterUserDTO';
import { UserResponseDTO, UserResponseMapper } from '../../dtos/UserResponseDTO';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { Name } from '../../../domain/value-objects/Name';
import { User } from '../../../domain/entities/User';
import { UserAlreadyExistsError } from '../../errors/UserAlreadyExistsError';
import { ZodError } from 'zod';
import { Role } from '@prisma/client';

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: RegisterUserInput): Promise<UserResponseDTO> {
    try {
      // 1. Validar entrada con Zod
      const validatedInput = RegisterUserSchema.parse(input);
      console.log('📝 Registrando usuario:', validatedInput.email);

      console.log('🔐 === PASSWORD HASHING ===');
      console.log('📝 Plain password:', validatedInput.password);

      // 2. Crear Value Objects
      const email = Email.create(validatedInput.email);
      const passwordObj = Password.create(validatedInput.password);
      const hashedPassword = await passwordObj.hash();

      console.log('🔑 Hashed password:', hashedPassword);
      console.log('✅ Longitud del hash:', hashedPassword.length);

      const password = Password.createFromHash(hashedPassword);

      // 3. Verificar si el email ya existe
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new UserAlreadyExistsError(validatedInput.email);
      }

      const name = Name.create(validatedInput.name);

      // 4. Crear entidad User
      const user = User.create(
        email,
        password,
        name,
        Role.USER
      );

      console.log('💾 Guardando usuario en BD...');

      // 5. Guardar en repositorio
      await this.userRepository.save(user);
      console.log('✅ Usuario guardado con ID:', user.getId().getValue());

      // 6. Retornar DTO
      console.log('📤 Convirtiendo a DTO...');
      const dto = UserResponseMapper.toDTO(user);
      console.log('✅ DTO creado:', dto);

      return dto;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      // Si es error de Zod, extraemos el mensaje
      if (error instanceof ZodError) {
        throw error;
      }
      throw error;
    }
  }
}