import { UserRegisteredEvent } from '../../../../src/domain/events/UserRegisteredEvent';

describe('UserRegisteredEvent', () => {
  describe('create', () => {
    it('should create a valid UserRegisteredEvent', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';
      const name = 'Test User';

      // Act
      const event = new UserRegisteredEvent(userId, email, name);

      // Assert
      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.registered');
      expect(event.userId).toBe(userId);
      expect(event.email).toBe(email);
      expect(event.name).toBe(name);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should set occurredOn to current date', () => {
      // Arrange
      const before = new Date();
      
      // Act
      const event = new UserRegisteredEvent(
        '123e4567-e89b-42d3-a456-426614174000',
        'test@example.com',
        'Test User'
      );
      const after = new Date();

      // Assert
      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should throw error if userId is empty', () => {
      // Act & Assert
      expect(() => {
        new UserRegisteredEvent('', 'test@example.com', 'Test User');
      }).toThrow('UserId is required');
    });

    it('should throw error if email is empty', () => {
      // Act & Assert
      expect(() => {
        new UserRegisteredEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          '',
          'Test User'
        );
      }).toThrow('Email is required');
    });

    it('should throw error if name is empty', () => {
      // Act & Assert
      expect(() => {
        new UserRegisteredEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          'test@example.com',
          ''
        );
      }).toThrow('Name is required');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation of event', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';
      const name = 'Test User';
      const event = new UserRegisteredEvent(userId, email, name);

      // Act
      const json = event.toJSON();

      // Assert
      expect(json).toEqual({
        eventName: 'user.registered',
        userId: userId,
        email: email,
        name: name,
        occurredOn: event.occurredOn.toISOString(),
      });
    });
  });
});