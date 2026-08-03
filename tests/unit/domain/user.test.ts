import { User } from '../../../src/domain/entities/User';
import { Email } from '../../../src/domain/value-objects/Email';
import { Name } from '../../../src/domain/value-objects/Name';
import { PlainPassword } from '../../../src/domain/value-objects/PlainPassword';
import { HashedPassword } from '../../../src/domain/value-objects/HashedPassword';
import { UserRegisteredEvent } from '../../../src/domain/events/UserRegisteredEvent';
import { UserDeletedEvent } from '../../../src/domain/events/UserDeletedEvent';
import { UserPasswordChangedEvent } from '../../../src/domain/events/UserPasswordChangedEvent';
import { UserEmailVerifiedEvent } from '../../../src/domain/events/UserEmailVerifiedEvent';
import { MockDateProvider } from '../../mocks/MockDateProvider';

describe('User Entity', () => {
  const mockDateProvider = new MockDateProvider(new Date('2024-01-15T10:00:00.000Z'));

  const createTestUser = async () => {
    return await User.create(
      Email.create('test@example.com'),
      PlainPassword.create('SecurePass123!'),
      Name.create('Test User'),
      'USER',
      mockDateProvider 
    );
  }

  describe('create', () => {
    it('should create a valid user', async () => {
      const email = Email.create('test@example.com');
      const password = PlainPassword.create('SecurePass123!');
      const name = Name.create('Test User');
      const role = 'USER';

      const user = await User.create(email, password, name, role, mockDateProvider);

      expect(user).toBeDefined();
      expect(user.getId()).toBeDefined();
      expect(user.getEmail()).toBe(email);
      expect(user.getPassword()).toBeInstanceOf(HashedPassword);
      expect(user.getName()).toBe(name);
      expect(user.getRole()).toBe('USER');
      expect(user.getCreatedAt()).toEqual(new Date('2024-01-15T10:00:00.000Z'));
      expect(user.getUpdatedAt()).toEqual(new Date('2024-01-15T10:00:00.000Z'));
      expect(user.getDeletedAt()).toBeNull();
    });

    it('should create a user with ADMIN role', async () => {
      const email = Email.create('admin@example.com');
      const password = PlainPassword.create('SecurePass123!');
      const name = Name.create('Admin User');
      const role = 'ADMIN';

      const user = await User.create(email, password, name, role, mockDateProvider);

      expect(user.getRole()).toBe('ADMIN');
    });

    it('should throw error for invalid role', async () => {
      const email = Email.create('test@example.com');
      const password = PlainPassword.create('SecurePass123!');
      const name = Name.create('Test User');
      const role = 'INVALID_ROLE';

      await expect(User.create(email, password, name, role, mockDateProvider)).rejects.toThrow(
        'Invalid role: INVALID_ROLE'
      );
    });
  });

  describe('update', () => {
    it('should update user name', async () => {
      const user = await User.create(
        Email.create('test@example.com'),
        PlainPassword.create('SecurePass123!'),
        Name.create('Old Name'),
        'USER',
        mockDateProvider
      );

      user.updateName(Name.create('New Name'), mockDateProvider);

      expect(user.getName().getValue()).toBe('New Name');
      expect(user.getUpdatedAt()).toEqual(new Date('2024-01-15T10:00:00.000Z'));
    });

    it('should update user role', async () => {
      const user = await User.create(
        Email.create('test@example.com'),
        PlainPassword.create('SecurePass123!'),
        Name.create('Test User'),
        'USER',
        mockDateProvider
      );

      user.updateRole('EDITOR', 'admin@example.com', mockDateProvider, 'Role change');

      expect(user.getRole()).toBe('EDITOR');
      expect(user.getUpdatedAt()).toEqual(new Date('2024-01-15T10:00:00.000Z'));
    });

    it('should throw error for invalid role on update', async () => {
      const user = await User.create(
        Email.create('test@example.com'),
        PlainPassword.create('SecurePass123!'),
        Name.create('Test User'),
        'USER',
        mockDateProvider
      );

      expect(() => user.updateRole('INVALID_ROLE', 'admin@example.com', mockDateProvider)).toThrow(
        'Invalid role: INVALID_ROLE'
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete user', async () => {
      const user = await User.create(
        Email.create('test@example.com'),
        PlainPassword.create('SecurePass123!'),
        Name.create('Test User'),
        'USER',
        mockDateProvider
      );

      user.softDelete('admin@example.com', 'Test deletion', mockDateProvider);

      expect(user.getDeletedAt()).toEqual(new Date('2024-01-15T10:00:00.000Z'));
      expect(user.isDeleted()).toBe(true);
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted user', async () => {
      const user = await User.create(
        Email.create('test@example.com'),
        PlainPassword.create('SecurePass123!'),
        Name.create('Test User'),
        'USER',
        mockDateProvider
      );
      user.softDelete('admin@example.com', 'Test deletion', mockDateProvider);

      user.restore('admin@example.com', mockDateProvider, 'Restoring user');

      expect(user.getDeletedAt()).toBeNull();
      expect(user.isDeleted()).toBe(false);
      expect(user.getUpdatedAt()).toEqual(new Date('2024-01-15T10:00:00.000Z'));
    });
  });

  describe('softDelete - edge cases', () => {
    it('should throw error when trying to delete already deleted user', async () => {
      const user = await User.create(
        Email.create('test@example.com'),
        PlainPassword.create('SecurePass123!'),
        Name.create('Test User'),
        'USER',
        mockDateProvider
      );
      user.softDelete('admin@example.com', 'Test deletion', mockDateProvider);

      expect(() => user.softDelete('admin@example.com', 'Test deletion', mockDateProvider)).toThrow(
        'User is already deleted'
      );
    });
  });

  describe('restore - edge cases', () => {
    it('should throw error when trying to restore a non-deleted user', async () => {
      const user = await User.create(
        Email.create('test@example.com'),
        PlainPassword.create('SecurePass123!'),
        Name.create('Test User'),
        'USER',
        mockDateProvider
      );

      expect(() => user.restore('admin@example.com', mockDateProvider)).toThrow(
        'User is not deleted'
      );
    });
  });

  describe('updateName - edge cases', () => {
    it('should throw error when updating name to empty string', async () => {
      const user = await User.create(
        Email.create('test@example.com'),
        PlainPassword.create('SecurePass123!'),
        Name.create('Test User'),
        'USER',
        mockDateProvider
      );

      expect(() => user.updateName(Name.create(''), mockDateProvider)).toThrow(
        'Name cannot be empty'
      );
    });

    it('should throw error when updating name to only spaces', async () => {
      const user = await User.create(
        Email.create('test@example.com'),
        PlainPassword.create('SecurePass123!'),
        Name.create('Test User'),
        'USER',
        mockDateProvider
      );

      expect(() => user.updateName(Name.create('    '), mockDateProvider)).toThrow(
        'Name cannot be empty'
      );
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const user = await User.create(
        Email.create('test@example.com'),
        PlainPassword.create('SecurePass123!'),
        Name.create('Test User'),
        'USER',
        mockDateProvider
      );
      const newPassword = PlainPassword.create('NewSecurePass123!');

      await user.updatePassword(newPassword, 'user@example.com', mockDateProvider, 'user_initiated');

      expect(user.getPassword()).toBeInstanceOf(HashedPassword);
      expect(user.getUpdatedAt()).toEqual(new Date('2024-01-15T10:00:00.000Z'));
    });
  });

  describe('Eventos de Dominio', () => {
    describe('UserRegisteredEvent', () => {
      it('should emit UserRegisteredEvent when user is created', async () => {
        const email = Email.create('test@example.com');
        const password = PlainPassword.create('SecurePass123!');
        const name = Name.create('Test User');
        const role = 'USER';

        const user = await User.create(email, password, name, role, mockDateProvider);

        const events = user.getEvents();
        expect(events).toHaveLength(1);
        
        const event = events[0] as UserRegisteredEvent;
        expect(event).toBeInstanceOf(UserRegisteredEvent);
        expect(event.eventName).toBe('user.registered');
        expect(event.userId).toBe(user.getId().getValue());
        expect(event.email).toBe(email.getValue());
        expect(event.name).toBe(name.getValue());
        expect(event.role).toBe(role);
        expect(event.occurredOn).toBeInstanceOf(Date);
      });

      it('should clear events after calling clearEvents()', async () => {
        const user = await createTestUser();
        expect(user.getEvents()).toHaveLength(1);

        user.clearEvents();

        expect(user.getEvents()).toHaveLength(0);
      });
    });

    describe('UserDeletedEvent', () => {
      it('should emit UserDeletedEvent when user is soft deleted', async () => {
        const user = await createTestUser();
        user.clearEvents();
        const deletedBy = 'admin@example.com';
        const reason = 'User requested deletion';

        user.softDelete(deletedBy, reason, mockDateProvider);

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

      it('should emit UserDeletedEvent when user is permanently deleted', async () => {
        const user = await createTestUser();
        user.clearEvents();
        const deletedBy = 'admin@example.com';
        const reason = 'User violated terms of service';

        user.permanentDelete(deletedBy, reason);

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
      it('should emit UserPasswordChangedEvent when password is updated', async () => {
        const user = await createTestUser();
        user.clearEvents();
        const newPassword = PlainPassword.create('NewSecurePass456!');

        await user.updatePassword(newPassword, 'user@example.com', mockDateProvider, 'user_initiated');

        const events = user.getEvents();
        expect(events).toHaveLength(1);
        
        const event = events[0] as UserPasswordChangedEvent;
        expect(event).toBeInstanceOf(UserPasswordChangedEvent);
        expect(event.eventName).toBe('user.password.changed');
        expect(event.userId).toBe(user.getId().getValue());
        expect(event.changedBy).toBe('user@example.com');
        expect(event.occurredOn).toBeInstanceOf(Date);
      });
    });

    describe('UserEmailVerifiedEvent', () => {
      it('should emit UserEmailVerifiedEvent when email is verified', async () => {
        const user = await createTestUser();
        user.clearEvents();

        const token = user.generateVerificationToken();

        user.verifyEmail(token, mockDateProvider);

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
      it('should accumulate multiple events', async () => {
        const user = await createTestUser();
        user.clearEvents();

        const token = user.generateVerificationToken();

        await user.updatePassword(PlainPassword.create('NewPassword123!'), 'user@example.com', mockDateProvider, 'user_initiated');
        user.verifyEmail(token, mockDateProvider);
        user.softDelete('admin@example.com', 'Testing multiple events', mockDateProvider);

        const events = user.getEvents();
        expect(events).toHaveLength(3);
        
        expect(events[0]).toBeInstanceOf(UserPasswordChangedEvent);
        expect(events[1]).toBeInstanceOf(UserEmailVerifiedEvent);
        expect(events[2]).toBeInstanceOf(UserDeletedEvent);
      });
    });

    describe('Auditoría', () => {
      it('should provide audit trail through events', async () => {
        const user = await createTestUser();
        user.clearEvents();

        const token = user.generateVerificationToken();

        await user.updatePassword(PlainPassword.create('NewPassword123!'), 'user@example.com', mockDateProvider, 'user_initiated');
        user.verifyEmail(token, mockDateProvider);
        user.softDelete('admin@example.com', 'User requested deletion', mockDateProvider);

        const events = user.getEvents();
        
        events.forEach(event => {
          expect(event.occurredOn).toBeInstanceOf(Date);
        });

        expect(events[0].occurredOn.getTime()).toBeLessThanOrEqual(events[1].occurredOn.getTime());
        expect(events[1].occurredOn.getTime()).toBeLessThanOrEqual(events[2].occurredOn.getTime());

        const auditLog = events.map(event => (event as any).toJSON());
        expect(auditLog).toHaveLength(3);
        
        auditLog.forEach(log => {
          expect(log).toHaveProperty('eventName');
          expect(log).toHaveProperty('occurredOn');
          expect(log).toHaveProperty('userId', user.getId().getValue());
        });
      });
    });
  });
});