import { RegisterUserUseCase } from '../../../../src/application/use-cases/auth/RegisterUserUseCase';
import { RegisterUserInput } from '../../../../src/application/dtos/RegisterUserDTO';
import { IUserRepository } from '../../../../src/domain/interfaces/IUserRepository';
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { Password } from '../../../../src/domain/value-objects/Password';
import { Name } from '../../../../src/domain/value-objects/Name';
import { Role } from '../../../../src/domain/enums/Role';
import { UserAlreadyExistsError } from '../../../../src/application/errors/UserAlreadyExistsError';

// Mock del repositorio
const mockUserRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterUserUseCase(mockUserRepository);
  });

  const validInput: RegisterUserInput = {
    email: 'test@example.com',
    password: 'Test123!@#',
    name: 'Test User'
  };

  describe('Success cases', () => {
    it('should register a user successfully', async () => {
    // Arrange
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockResolvedValue();

    // Act
    const result = await useCase.execute(validInput);

    // Assert
    expect(result).toMatchObject({
        email: validInput.email,
        name: validInput.name,
        role: Role.USER
    });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should hash the password before saving', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue();
      
      let savedUser: User | undefined;
      mockUserRepository.save.mockImplementation(async (user: User) => {
        savedUser = user;
      });

      // Act
      await useCase.execute(validInput);

      // Assert
      expect(savedUser).toBeDefined();
      // ✅ Usamos getValue() en lugar de .value
      expect(savedUser?.getPassword().getValue()).not.toBe(validInput.password);
      expect(savedUser?.getPassword().getValue()).toMatch(/^\$2[aby]\$\d+\$.+$/);
    });

    it('should assign USER role by default', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue();
      
      let savedUser: User | undefined;
      mockUserRepository.save.mockImplementation(async (user: User) => {
        savedUser = user;
      });

      // Act
      await useCase.execute(validInput);

      // Assert
      expect(savedUser?.getRole()).toBe(Role.USER);
    });
  });

  describe('Error cases', () => {
    it('should throw error if email already exists', async () => {
      // Arrange
      const existingUser = User.create(
        Email.create(validInput.email),
        await Password.create(validInput.password),
        Name.create('Existing User'),
        Role.USER
      );
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(validInput))
        .rejects
        .toThrow(UserAlreadyExistsError);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if email is invalid', async () => {
      // Arrange
      const invalidInput = { ...validInput, email: 'invalid-email' };

      // Act & Assert
      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Invalid email format');
    });

    it('should throw error if password is weak', async () => {
      // Arrange
      const invalidInput = { ...validInput, password: '123' };

      // Act & Assert
      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Password must be at least 8 characters');
    });

    it('should throw error if name is empty', async () => {
      // Arrange
      const invalidInput = { ...validInput, name: '' };

      // Act & Assert
      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Name is required');
    });

    it('should throw error if email is empty', async () => {
      // Arrange
      const invalidInput = { ...validInput, email: '' };

      // Act & Assert
      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Email is required');
    });
  });
});