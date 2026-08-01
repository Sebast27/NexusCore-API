import { DeleteUserUseCase } from '../../../../src/application/use-cases/users/DeleteUserUseCase';
import { IUserRepository } from '../../../../src/domain/interfaces/IUserRepository';
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { Password } from '../../../../src/domain/value-objects/Password';
import { Name } from '../../../../src/domain/value-objects/Name';
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
  const deletedBy = 'admin@example.com';
  const reason = 'User deleted by administrator';

  beforeEach(async () => {
    jest.clearAllMocks();
    useCase = new DeleteUserUseCase(mockUserRepository);
    
    mockUser = User.create(
      Email.create('test@test.com'),
      await Password.create('Test123!@#'),
      Name.create('Test User'),
      Role.USER
    );
  });

  describe('Success cases', () => {
    it('should delete user successfully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue();

      // ✅ CORREGIDO: pasar deletedBy y reason
      await useCase.execute(
        mockUser.getId().getValue(), // ← Convertir UserId a string
        deletedBy,
        reason
      );

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

      const nonExistentId = '123e4567-e89b-42d3-a456-426614174000';
      await expect(useCase.execute(nonExistentId, deletedBy, reason))
        .rejects
        .toThrow('User not found');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if user is already deleted', async () => {
      // Arrange
      // ✅ CORREGIDO: softDelete requiere deletedBy y reason
      mockUser.softDelete(deletedBy, 'User was already deleted');
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // ✅ CORREGIDO: pasar los 3 argumentos
      await expect(useCase.execute(
        mockUser.getId().getValue(),
        deletedBy,
        reason
      ))
        .rejects
        .toThrow('User is already deleted');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});