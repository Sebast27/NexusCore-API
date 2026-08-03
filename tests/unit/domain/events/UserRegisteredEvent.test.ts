import { UserRegisteredEvent } from '../../../../src/domain/events/UserRegisteredEvent';

describe('UserRegisteredEvent', () => {
  describe('create', () => {
    it('should create a valid UserRegisteredEvent', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';
      const name = 'Test User';
      const role = 'USER';

      // Act
      const event = new UserRegisteredEvent(userId, email, name, role);

      // Assert
      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.registered');
      expect(event.userId).toBe(userId);
      expect(event.email).toBe(email);
      expect(event.name).toBe(name);
      expect(event.role).toBe(role);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should set occurredOn to current date', () => {
      // Arrange
      const before = new Date();
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';
      const name = 'Test User';
      const role = 'USER';
      
      // Act
      const event = new UserRegisteredEvent(userId, email, name, role);
      const after = new Date();

      // Assert
      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should create event with metadata when provided', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';
      const name = 'Test User';
      const role = 'ADMIN';
      const metadata = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        correlationId: 'abc-123'
      };

      // Act
      const event = new UserRegisteredEvent(userId, email, name, role, metadata);

      // Assert
      // Verificar que el evento se creó correctamente
      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.registered');
      expect(event.userId).toBe(userId);
      expect(event.email).toBe(email);
      expect(event.name).toBe(name);
      expect(event.role).toBe(role);
      expect(event.occurredOn).toBeInstanceOf(Date);
      
      // Verificar que metadata está en el JSON
      const json = event.toJSON();
      expect(json.metadata).toEqual(metadata);
    });

    it('should throw error if userId is empty', () => {
      // Act & Assert
      expect(() => {
        new UserRegisteredEvent('', 'test@example.com', 'Test User', 'USER');
      }).toThrow('UserId is required');
    });

    it('should throw error if email is empty', () => {
      // Act & Assert
      expect(() => {
        new UserRegisteredEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          '',
          'Test User',
          'USER'
        );
      }).toThrow('Email is required');
    });

    it('should throw error if name is empty', () => {
      // Act & Assert
      expect(() => {
        new UserRegisteredEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          'test@example.com',
          '',
          'USER'
        );
      }).toThrow('Name is required');
    });

    it('should throw error if role is empty', () => {
      // Act & Assert
      expect(() => {
        new UserRegisteredEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          'test@example.com',
          'Test User',
          ''
        );
      }).toThrow('Role is required');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation of event', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';
      const name = 'Test User';
      const role = 'USER';
      const event = new UserRegisteredEvent(userId, email, name, role);

      // Act
      const json = event.toJSON();

      // Assert
      expect(json).toEqual({
        eventName: 'user.registered',
        userId: userId,
        email: email,
        name: name,
        role: role,
        occurredOn: event.occurredOn.toISOString(),
        metadata: null,
      });
    });
  });
});