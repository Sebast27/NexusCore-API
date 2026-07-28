import { LogoutUseCase } from '../../../../src/application/use-cases/auth/LogoutUseCase';
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

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let mockUser: User;

  beforeEach(async () => {
    jest.clearAllMocks();
    useCase = new LogoutUseCase(mockUserRepository);
    
    mockUser = User.create(
      Email.create('test@test.com'),
      await Password.create('Test123!@#'),
      'Test User',
      Role.USER
    );
  });

  describe('Success cases', () => {
    it('should logout successfully when user exists', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      await useCase.execute({ userId: mockUser.getId() });

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.getId());
    });
  });

  describe('Error cases', () => {
    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute({ userId: 'non-existent-id' }))
        .rejects
        .toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });
});