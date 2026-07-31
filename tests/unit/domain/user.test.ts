import { User } from '../../../src/domain/entities/User';
import { Email } from '../../../src/domain/value-objects/Email';
import { Password } from '../../../src/domain/value-objects/Password';
import { Name } from '../../../src/domain/value-objects/Name';
import { UserRegisteredEvent } from '../../../src/domain/events/UserRegisteredEvent';
import { UserDeletedEvent } from '../../../src/domain/events/UserDeletedEvent';
import { UserPasswordChangedEvent } from '../../../src/domain/events/UserPasswordChangedEvent';
import { UserEmailVerifiedEvent } from '../../../src/domain/events/UserEmailVerifiedEvent';

describe('User Entity', () => {

  const createTestUser = () => {
    return User.create(
      Email.create('test@example.com'),
      Password.create('SecurePass123!'),
      Name.create('Test User'),
      'USER'
    );
  }

  describe('create', () => {
    it('should create a valid user', () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create('SecurePass123!');
      const name = Name.create('Test User');
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
      const name = Name.create('Admin User');
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
      const name = Name.create('Test User');
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
        Name.create('Old Name'),
        'USER'
      );

      // Act
      user.updateName(Name.create('New Name'));

      // Assert
      expect(user.getName().getValue()).toBe('New Name');
    });

    it('should update user role', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        Name.create('Test User'),
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
        Name.create('Test User'),
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
        Name.create('Test User'),
        'USER'
      );

      // Act
      user.softDelete('admin@example.com', 'Test deletion');

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
        Name.create('Test User'),
        'USER'
      );
      user.softDelete('admin@example.com', 'Test deletion');

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
        Name.create('Test User'),
        'USER'
      );
      user.softDelete('admin@example.com', 'Test deletion');

      // Act & Assert
      expect(() => user.softDelete('admin@example.com', 'Test deletion')).toThrow('User is already deleted');
    });
  });

  describe('restore - edge cases', () => {
    it('should throw error when trying to restore a non-deleted user', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        Name.create('Test User'),
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
        Name.create('Test User'),
        'USER'
      );

      // Act & Assert
      expect(() => user.updateName(Name.create(''))).toThrow('Name cannot be empty');
    });

    it('should throw error when updating name to only spaces', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        Name.create('Test User'),
        'USER'
      );

      // Act & Assert
      expect(() => user.updateName(Name.create('    '))).toThrow('Name cannot be empty');
    });
  });

  describe('updatePassword', () => {
    it('should update user password', () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        Name.create('Test User'),
        'USER'
      );
      const newPassword = Password.create('NewSecurePass123!');

      // Act
      user.updatePassword(newPassword);

      // Assert
      expect(user.getPassword()).toBe(newPassword);
    });
  });

  describe('Eventos de Dominio', () => {
    describe('UserRegisteredEvent', () => {
      it('should emit UserRegisteredEvent when user is created', () => {
        // Arrange
        const email = Email.create('test@example.com');
        const password = Password.create('SecurePass123!');
        const name = Name.create('Test User');
        const role = 'USER';

        // Act
        const user = User.create(email, password, name, role);

        // Assert
        const events = user.getEvents();
        expect(events).toHaveLength(1);
        
        const event = events[0] as UserRegisteredEvent;
        expect(event).toBeInstanceOf(UserRegisteredEvent);
        expect(event.eventName).toBe('user.registered');
        expect(event.userId).toBe(user.getId().getValue());
        expect(event.email).toBe(email.getValue());
        expect(event.name).toBe(name.getValue());
        expect(event.occurredOn).toBeInstanceOf(Date);
      });

      it('should clear events after calling clearEvents()', () => {
        // Arrange
        const user = createTestUser();
        expect(user.getEvents()).toHaveLength(1);

        // Act
        user.clearEvents();

        // Assert
        expect(user.getEvents()).toHaveLength(0);
      });
    });

    describe('UserDeletedEvent', () => {
      it('should emit UserDeletedEvent when user is soft deleted', () => {
        // Arrange
        const user = createTestUser();
        user.clearEvents(); // Limpiar evento de registro
        const deletedBy = 'admin@example.com';
        const reason = 'User requested deletion';

        // Act
        user.softDelete(deletedBy, reason);

        // Assert
        const events = user.getEvents();
        expect(events).toHaveLength(1);
        
        const event = events[0] as UserDeletedEvent;
        expect(event).toBeInstanceOf(UserDeletedEvent);
        expect(event.eventName).toBe('user.deleted');
        expect(event.userId).toBe(user.getId().getValue());
        expect(event.deletedBy).toBe(deletedBy);
        expect(event.reason).toBe(reason);
        expect(event.occurredOn).toBeInstanceOf(Date);
      });

      it('should emit UserDeletedEvent when user is permanently deleted', () => {
        // Arrange
        const user = createTestUser();
        user.clearEvents();
        const deletedBy = 'admin@example.com';
        const reason = 'User violated terms of service';

        // Act
        user.permanentDelete(deletedBy, reason);

        // Assert
        const events = user.getEvents();
        expect(events).toHaveLength(1);
        
        const event = events[0] as UserDeletedEvent;
        expect(event).toBeInstanceOf(UserDeletedEvent);
        expect(event.eventName).toBe('user.deleted');
        expect(event.userId).toBe(user.getId().getValue());
        expect(event.deletedBy).toBe(deletedBy);
        expect(event.reason).toBe(reason);
      });
    });

    describe('UserPasswordChangedEvent', () => {
      it('should emit UserPasswordChangedEvent when password is updated', () => {
        // Arrange
        const user = createTestUser();
        user.clearEvents();
        const newPassword = Password.create('NewSecurePass456!');

        // Act
        user.updatePassword(newPassword);

        // Assert
        const events = user.getEvents();
        expect(events).toHaveLength(1);
        
        const event = events[0] as UserPasswordChangedEvent;
        expect(event).toBeInstanceOf(UserPasswordChangedEvent);
        expect(event.eventName).toBe('user.password.changed');
        expect(event.userId).toBe(user.getId().getValue());
        expect(event.occurredOn).toBeInstanceOf(Date);
      });
    });

    describe('UserEmailVerifiedEvent', () => {
      it('should emit UserEmailVerifiedEvent when email is verified', () => {
        // Arrange
        const user = createTestUser();
        user.clearEvents();

        // Generar token
        const token = user.generateVerificationToken();

        // Act
        user.verifyEmail(token);

        // Assert
        const events = user.getEvents();
        expect(events).toHaveLength(1);
        
        const event = events[0] as UserEmailVerifiedEvent;
        expect(event).toBeInstanceOf(UserEmailVerifiedEvent);
        expect(event.eventName).toBe('user.email.verified');
        expect(event.userId).toBe(user.getId().getValue());
        expect(event.email).toBe(user.getEmail().getValue());
        expect(event.occurredOn).toBeInstanceOf(Date);
      });
    });

    describe('Múltiples eventos', () => {
      it('should accumulate multiple events', () => {
        // Arrange
        const user = createTestUser(); // Emite UserRegisteredEvent
        user.clearEvents(); // Limpiar

        // Generar token
        const token = user.generateVerificationToken();

        // Act - Realizar múltiples acciones
        user.updatePassword(Password.create('NewPassword123!'));
        user.verifyEmail(token);
        
        // El soft delete requiere deletedBy y reason
        user.softDelete('admin@example.com', 'Testing multiple events');

        // Assert
        const events = user.getEvents();
        expect(events).toHaveLength(3);
        
        expect(events[0]).toBeInstanceOf(UserPasswordChangedEvent);
        expect(events[1]).toBeInstanceOf(UserEmailVerifiedEvent);
        expect(events[2]).toBeInstanceOf(UserDeletedEvent);
      });
    });

    describe('Auditoría', () => {
      it('should provide audit trail through events', () => {
        // Arrange
        const user = createTestUser();
        user.clearEvents();

        // Generar token
        const token = user.generateVerificationToken();

        // Act - Simular acciones de usuario
        user.updatePassword(Password.create('NewPassword123!'));
        user.verifyEmail(token);
        user.softDelete('admin@example.com', 'User requested deletion');

        // Assert - Verificar que los eventos proporcionan trazabilidad
        const events = user.getEvents();
        
        // Cada evento tiene timestamp
        events.forEach(event => {
          expect(event.occurredOn).toBeInstanceOf(Date);
        });

        // Orden cronológico (el primero es el más antiguo)
        expect(events[0].occurredOn.getTime()).toBeLessThanOrEqual(events[1].occurredOn.getTime());
        expect(events[1].occurredOn.getTime()).toBeLessThanOrEqual(events[2].occurredOn.getTime());

        // Verificar que podemos convertir a JSON para logging
        const auditLog = events.map(event => (event as any).toJSON());
        expect(auditLog).toHaveLength(3);
        
        // Verificar estructura del log
        auditLog.forEach(log => {
          expect(log).toHaveProperty('eventName');
          expect(log).toHaveProperty('occurredOn');
          expect(log).toHaveProperty('userId', user.getId().getValue());
        });
      });
    });
  });
});