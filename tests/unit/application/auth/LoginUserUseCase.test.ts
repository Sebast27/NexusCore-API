import { LoginUserUseCase } from '../../../../src/application/use-cases/auth/LoginUserUseCase';
import { LoginUserInput } from '../../../../src/application/dtos/LoginUserDTO';
import { IUserRepository } from '../../../../src/domain/interfaces/repositories/IUserRepository';
import { ILoginAttemptRepository } from '../../../../src/domain/interfaces/repositories/ILoginAttemptRepository';
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { PlainPassword } from '../../../../src/domain/value-objects/PlainPassword';
import { Name } from '../../../../src/domain/value-objects/Name';
import { Role } from '../../../../src/domain/enums/Role';
import { MockDateProvider } from '../../../mocks/MockDateProvider'; // ✅ IMPORTAR
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

const mockUserRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

const mockLoginAttemptRepository: jest.Mocked<ILoginAttemptRepository> = {
  save: jest.fn(),
  saveMany: jest.fn(),
  findByEmail: jest.fn(),
  findByIpAddress: jest.fn(),
  findByUserId: jest.fn(),
  getRecentFailures: jest.fn(),
  getFailuresByIp: jest.fn()
};

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockDateProvider: MockDateProvider; // ✅ DECLARAR

  beforeEach(() => {
    jest.clearAllMocks();
    mockDateProvider = new MockDateProvider(); // ✅ CREAR
    useCase = new LoginUserUseCase(
      mockUserRepository,
      mockLoginAttemptRepository
    );
  });

  const validInput: LoginUserInput = {
    email: 'test@example.com',
    password: 'Test123!@#'
  };

  describe('Success cases', () => {
    it('should login successfully and return token', async () => {
      // ✅ Pasar mockDateProvider a User.create
      const mockUser = await User.create(
        Email.create(validInput.email),
        PlainPassword.create(validInput.password),
        Name.create('Test User'),
        Role.USER,
        mockDateProvider // ✅ PASAR
      );
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const result = await useCase.execute(validInput);

      expect(result).toMatchObject({
        id: mockUser.getId().getValue(),
        email: validInput.email,
        name: mockUser.getName().getValue(),
        role: mockUser.getRole(),
        accessToken: 'mock-jwt-token'
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(mockLoginAttemptRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should call jwt.sign with correct payload', async () => {
      const mockUser = await User.create(
        Email.create(validInput.email),
        PlainPassword.create(validInput.password),
        Name.create('Test User'),
        Role.USER,
        mockDateProvider // ✅ PASAR
      );
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      await useCase.execute(validInput);

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
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(validInput))
        .rejects
        .toThrow('Invalid credentials');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      const mockUser = await User.create(
        Email.create(validInput.email),
        PlainPassword.create(validInput.password),
        Name.create('Test User'),
        Role.USER,
        mockDateProvider // ✅ PASAR
      );
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const invalidInput = { ...validInput, password: 'WrongPassword123!' };
      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Invalid credentials');
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if email is invalid', async () => {
      const invalidInput = { ...validInput, email: 'invalid-email' };

      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Invalid email format');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if email is empty', async () => {
      const invalidInput = { ...validInput, email: '' };

      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Email is required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if password is empty', async () => {
      const invalidInput = { ...validInput, password: '' };

      await expect(useCase.execute(invalidInput))
        .rejects
        .toThrow('Password is required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return refresh token on login', async () => {
      const mockUser = await User.create(
        Email.create(validInput.email),
        PlainPassword.create(validInput.password),
        Name.create('Test User'),
        Role.USER,
        mockDateProvider // ✅ PASAR
      );
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const result = await useCase.execute(validInput);

      expect(result).toHaveProperty('refreshToken');
      expect(result.refreshToken).toBeDefined();
      expect(typeof result.refreshToken).toBe('string');
    });
  });
});