import { RefreshTokenUseCase } from '../../../../src/application/use-cases/auth/RefreshTokenUseCase';
import { IUserRepository } from '../../../../src/domain/interfaces/repositories/IUserRepository'; 
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { PlainPassword } from '../../../../src/domain/value-objects/PlainPassword'; 
import { Name } from '../../../../src/domain/value-objects/Name';
import { Role } from '../../../../src/domain/enums/Role';
import { MockDateProvider } from '../../../mocks/MockDateProvider';
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
  let mockDateProvider: MockDateProvider;
  let mockUser: User;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDateProvider = new MockDateProvider();
    useCase = new RefreshTokenUseCase(mockUserRepository);
    
    mockUser = await User.create( 
      Email.create('test@test.com'),
      PlainPassword.create('Test123!@#'), 
      Name.create('Test User'),
      Role.USER,
      mockDateProvider
    );
  });

  describe('Success cases', () => {
    it('should generate a new access token with valid refresh token', async () => {
      // Arrange
      const mockRefreshToken = 'valid-refresh-token-string';
      const mockDecoded = {
        id: mockUser.getId().getValue(),
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
        id: mockUser.getId().getValue(), // ✅ Usar getValue()
        email: mockUser.getEmail().getValue(),
        role: mockUser.getRole(),
        type: 'access'
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
      const mockRefreshToken = 'valid-refresh-token-string';
      const mockDecoded = {
        id: '123e4567-e89b-42d3-a456-426614174000',
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