import { DeleteUserUseCase } from '../../../../src/application/use-cases/users/DeleteUserUseCase';
import { IUserRepository } from '../../../../src/domain/interfaces/IUserRepository';
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { Password } from '../../../../src/domain/value-objects/Password';
import { Role } from '../../../../src/domain/enums/Role';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let mockUser: User;

  beforeEach(async () => {
    jest.clearAllMocks();
    useCase = new DeleteUserUseCase(mockUserRepository);
    
    mockUser = User.create(
      Email.create('test@test.com'),
      await Password.create('Test123!@#'),
      'Test User',
      Role.USER
    );
  });

  describe('Success cases', () => {
    it('should delete user successfully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue();

      // Act
      await useCase.execute(mockUser.getId());

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.getId());
      expect(mockUser.isDeleted()).toBe(true);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Error cases', () => {
    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('non-existent-id'))
        .rejects
        .toThrow('User not found');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if user is already deleted', async () => {
      // Arrange
      mockUser.softDelete();
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(useCase.execute(mockUser.getId()))
        .rejects
        .toThrow('User is already deleted');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});