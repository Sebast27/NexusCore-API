import { User } from '../../../src/domain/entities/User';
import { Email } from '../../../src/domain/value-objects/Email';
import { Password } from '../../../src/domain/value-objects/Password';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a valid user', () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create('SecurePass123!');
      const name = 'Test User';
      const role = 'USER';

      // Act
      const user = User.create(email, password, name, role);

      // Assert
      expect(user).toBeDefined();
      expect(user.getId()).toBeDefined();
      expect(user.getEmail()).toBe(email);
      expect(user.getPassword()).toBe(password);
      expect(user.getName()).toBe(name);
      expect(user.getRole()).toBe('USER');
      expect(user.getCreatedAt()).toBeInstanceOf(Date);
      expect(user.getUpdatedAt()).toBeInstanceOf(Date);
      expect(user.getDeletedAt()).toBeNull();
    });

    it('should create a user with ADMIN role', () => {
      // Arrange
      const email = Email.create('admin@example.com');
      const password = Password.create('SecurePass123!');
      const name = 'Admin User';
      const role = 'ADMIN';

      // Act
      const user = User.create(email, password, name, role);

      // Assert
      expect(user.getRole()).toBe('ADMIN');
    });

    it('should throw error for invalid role', () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create('SecurePass123!');
      const name = 'Test User';
      const role = 'INVALID_ROLE';

      // Act & Assert
      expect(() => User.create(email, password, name, role)).toThrow(
        'Invalid role: INVALID_ROLE'
      );
    });
  });

  describe('update', () => {
    it('should update user name', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        'Old Name',
        'USER'
      );

      // Act
      user.updateName('New Name');

      // Assert
      expect(user.getName()).toBe('New Name');
    });

    it('should update user role', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        'Test User',
        'USER'
      );

      // Act
      user.updateRole('EDITOR');

      // Assert
      expect(user.getRole()).toBe('EDITOR');
    });

    it('should throw error for invalid role on update', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        'Test User',
        'USER'
      );

      // Act & Assert
      expect(() => user.updateRole('INVALID_ROLE')).toThrow(
        'Invalid role: INVALID_ROLE'
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete user', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        'Test User',
        'USER'
      );

      // Act
      user.softDelete();

      // Assert
      expect(user.getDeletedAt()).toBeInstanceOf(Date);
      expect(user.isDeleted()).toBe(true);
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted user', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        'Test User',
        'USER'
      );
      user.softDelete();

      // Act
      user.restore();

      // Assert
      expect(user.getDeletedAt()).toBeNull();
      expect(user.isDeleted()).toBe(false);
    });
  });

    describe('softDelete - edge cases', () => {
    it('should throw error when trying to delete already deleted user', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        'Test User',
        'USER'
      );
      user.softDelete();

      // Act & Assert
      expect(() => user.softDelete()).toThrow('User is already deleted');
    });
  });

  describe('restore - edge cases', () => {
    it('should throw error when trying to restore a non-deleted user', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        'Test User',
        'USER'
      );

      // Act & Assert
      expect(() => user.restore()).toThrow('User is not deleted');
    });
  });

  describe('updateName - edge cases', () => {
    it('should throw error when updating name to empty string', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        'Test User',
        'USER'
      );

      // Act & Assert
      expect(() => user.updateName('')).toThrow('Name cannot be empty');
    });

    it('should throw error when updating name to only spaces', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        'Test User',
        'USER'
      );

      // Act & Assert
      expect(() => user.updateName('   ')).toThrow('Name cannot be empty');
    });
  });

  describe('updatePassword', () => {
    it('should update user password', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        'Test User',
        'USER'
      );
      const newPassword = Password.create('NewSecurePass123!');

      // Act
      user.updatePassword(newPassword);

      // Assert
      expect(user.getPassword()).toBe(newPassword);
    });
  });
});