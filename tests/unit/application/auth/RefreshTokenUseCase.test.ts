import { RefreshTokenUseCase } from '../../../../src/application/use-cases/auth/RefreshTokenUseCase';
import { IUserRepository } from '../../../../src/domain/interfaces/IUserRepository';
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { Password } from '../../../../src/domain/value-objects/Password';
import { Role } from '../../../../src/domain/enums/Role';
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

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let mockUser: User;

  beforeEach(async () => {
    jest.clearAllMocks();
    useCase = new RefreshTokenUseCase(mockUserRepository);
    
    mockUser = User.create(
      Email.create('test@test.com'),
      await Password.create('Test123!@#'),
      'Test User',
      Role.USER
    );
  });

  describe('Success cases', () => {
    it('should generate a new access token with valid refresh token', async () => {
      // Arrange
      const mockRefreshToken = 'valid-refresh-token';
      const mockDecoded = {
        id: mockUser.getId(),
        email: mockUser.getEmail().getValue(),
        role: mockUser.getRole(),
        type: 'refresh'
      };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (jwt.sign as jest.Mock).mockReturnValue('new-access-token');

      // Act
      const result = await useCase.execute({ refreshToken: mockRefreshToken });

      // Assert
      expect(result).toEqual({ accessToken: 'new-access-token' });
      expect(jwt.verify).toHaveBeenCalledWith(
        mockRefreshToken,
        expect.any(String)
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.getId());
      expect(jwt.sign).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error cases', () => {
    it('should throw error if refresh token is invalid', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      // Act & Assert
      await expect(useCase.execute({ refreshToken: 'invalid-token' }))
        .rejects
        .toThrow('Invalid refresh token');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error if refresh token is expired', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      // Act & Assert
      await expect(useCase.execute({ refreshToken: 'expired-token' }))
        .rejects
        .toThrow('Refresh token expired');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error if token type is not refresh', async () => {
      // Arrange
      const mockDecoded = {
        id: mockUser.getId(),
        email: mockUser.getEmail().getValue(),
        role: mockUser.getRole(),
        type: 'access' // 👈 Tipo incorrecto
      };
      
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      // Act & Assert
      await expect(useCase.execute({ refreshToken: 'access-token' }))
        .rejects
        .toThrow('Invalid token type');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const mockRefreshToken = 'valid-refresh-token';
      const mockDecoded = {
        id: 'non-existent-id',
        email: 'test@test.com',
        role: 'USER',
        type: 'refresh'
      };
      
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute({ refreshToken: mockRefreshToken }))
        .rejects
        .toThrow('User not found');
    });
  });
});