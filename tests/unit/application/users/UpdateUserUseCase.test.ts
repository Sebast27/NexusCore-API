import { UpdateUserUseCase } from '../../../../src/application/use-cases/users/UpdateUserUseCase';
import { IUserRepository } from '../../../../src/domain/interfaces/repositories/IUserRepository'; 
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { PlainPassword } from '../../../../src/domain/value-objects/PlainPassword';
import { Name } from '../../../../src/domain/value-objects/Name';
import { MockDateProvider } from '../../../mocks/MockDateProvider';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let mockDateProvider: MockDateProvider;
  let mockUser: User;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDateProvider = new MockDateProvider();
    useCase = new UpdateUserUseCase(mockUserRepository, mockDateProvider);
    
    mockUser = await User.create( 
      Email.create('test@test.com'),
      PlainPassword.create('Test123!@#'),
      Name.create('Test User'),
      'USER',
      mockDateProvider
    );
  });

  describe('Success cases', () => {
    it('should update user name successfully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue();

      const newName = Name.create('Updated Name');
      
      // Act
      const result = await useCase.execute(
        mockUser.getId().getValue(),
        { name: newName }
      );

      // Assert
      expect(result.name).toBe('Updated Name');
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser);
    });

    it('should update user role successfully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue();

      // Act
      const result = await useCase.execute(
        mockUser.getId().getValue(),
        { role: 'ADMIN' } 
      );

      // Assert
      expect(result.role).toBe('ADMIN'); 
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser);
    });

    it('should update both name and role successfully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue();

      const newName = Name.create('New Name');
      
      // Act
      const result = await useCase.execute(
        mockUser.getId().getValue(),
        { name: newName, role: 'ADMIN' } 
      );

      // Assert
      expect(result.name).toBe('New Name');
      expect(result.role).toBe('ADMIN'); 
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Error cases', () => {
    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      const nonExistentId = '123e4567-e89b-42d3-a456-426614174000';
      
      // Act & Assert
      await expect(useCase.execute(nonExistentId, { name: Name.create('New Name') }))
        .rejects
        .toThrow('User not found');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if role is invalid', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(useCase.execute(
        mockUser.getId().getValue(),
        { role: 'INVALID_ROLE' as any }
      ))
        .rejects
        .toThrow('Invalid role: INVALID_ROLE');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});