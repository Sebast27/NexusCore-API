import { RegisterUserInput, RegisterUserSchema } from '../../dtos/RegisterUserDTO';
import { UserResponseDTO, UserResponseMapper } from '../../dtos/UserResponseDTO';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository'; 
import { Email } from '../../../domain/value-objects/Email';
import { PlainPassword } from '../../../domain/value-objects/PlainPassword';
import { Name } from '../../../domain/value-objects/Name';
import { User } from '../../../domain/entities/User';
import { IDateProvider } from '../../../domain/interfaces/IDateProvider';
import { Role } from '../../../domain/enums/Role';
import { EmailAlreadyExistsError } from '../../../domain/errors';

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository, private dateProvider: IDateProvider) {}

  async execute(input: RegisterUserInput): Promise<UserResponseDTO> {

      // 1. Validar entrada con Zod
      const validatedInput = RegisterUserSchema.parse(input);

      // 2. Crear Value Objects
      const email = Email.create(validatedInput.email);
      const plainPassword = PlainPassword.create(validatedInput.password);

      // 3. Verificar si el email ya existe
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new EmailAlreadyExistsError(validatedInput.email);
      }

      const name = Name.create(validatedInput.name);
      const role = validatedInput.role || Role.USER;
      
      // 4. Crear entidad User
      const user = await User.create(
        email,
        plainPassword,
        name,
        role,
        this.dateProvider
      );

      // 5. Guardar en repositorio
      await this.userRepository.save(user);

      // 6. Retornar DTO
      return UserResponseMapper.toDTO(user);
  }
}