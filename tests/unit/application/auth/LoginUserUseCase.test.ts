import { LoginUserUseCase } from '../../../../src/application/use-cases/auth/LoginUserUseCase';
import { LoginUserInput } from '../../../../src/application/dtos/LoginUserDTO';
import { IUserRepository } from '../../../../src/domain/interfaces/IUserRepository';
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { Password } from '../../../../src/domain/value-objects/Password';
import { Name } from '../../../../src/domain/value-objects/Name';
import { Role } from '../../../../src/domain/enums/Role';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mock de jsonwebtoken
jest.mock('jsonwebtoken');

// Mock del repositorio
const mockUserRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUserUseCase(mockUserRepository);
  });

  const validInput: LoginUserInput = {
    email: 'test@example.com',
    password: 'Test123!@#'
  };

  describe('Success cases', () => {
    it('should login successfully and return token', async () => {
      // Arrange
      const plainPassword = validInput.password;
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const password = Password.createFromHash(hashedPassword);
      
      const mockUser = User.create(
        Email.create(validInput.email),
        password,
        Name.create('Test User'),
        Role.USER
      );
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result).toMatchObject({
        id: mockUser.getId().getValue(),
        email: validInput.email,
        name: mockUser.getName().getValue(),
        role: mockUser.getRole(),
        accessToken: 'mock-jwt-token'
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
      
      // ✅ CORREGIDO: Se llama 2 veces (access + refresh)
      expect(jwt.sign).toHaveBeenCalledTimes(2);
    });

    it('should call jwt.sign with correct payload', async () => {
      // Arrange
      const plainPassword = validInput.password;
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const password = Password.createFromHash(hashedPassword);

      const mockUser = User.create(
        Email.create(validInput.email),
        password,
        Name.create('Test User'),
        Role.USER
      );
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      // Act
      await useCase.execute(validInput);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.getId().getValue(),
          email: mockUser.getEmail().getValue(),
          role: mockUser.getRole()
        },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
    });
  });

  describe('Error cases', () => {
    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validInput))
        .rejects
        .toThrow('Invalid credentials');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      // Arrange
      const plainPassword = validInput.password;
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const password = Password.createFromHash(hashedPassword);
      
      const mockUser = User.create(
        Email.create(validInput.email),
        password,
        Name.create('Test User'),
        Role.USER
      );
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      const invalidInput = { ...validInput, password: 'WrongPassword123!' };
      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Invalid credentials');
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if email is invalid', async () => {
      // Arrange
      const invalidInput = { ...validInput, email: 'invalid-email' };

      // Act & Assert
      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Invalid email format');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if email is empty', async () => {
      // Arrange
      const invalidInput = { ...validInput, email: '' };

      // Act & Assert
      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Email is required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if password is empty', async () => {
      // Arrange
      const invalidInput = { ...validInput, password: '' };

      // Act & Assert
      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Password is required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return refresh token on login', async () => {
      // Arrange
      const plainPassword = validInput.password;
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const password = Password.createFromHash(hashedPassword);
      
      const mockUser = User.create(
        Email.create(validInput.email),
        password,
        Name.create('Test User'),
        Role.USER
      );
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result).toHaveProperty('refreshToken');
      expect(result.refreshToken).toBeDefined();
      expect(typeof result.refreshToken).toBe('string');
    });
  });
});