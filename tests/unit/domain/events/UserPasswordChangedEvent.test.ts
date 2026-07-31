import { UserPasswordChangedEvent } from '../../../../src/domain/events/UserPasswordChangedEvent';

describe('UserPasswordChangedEvent', () => {
  describe('create', () => {
    it('should create a valid UserPasswordChangedEvent', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';

      // Act
      const event = new UserPasswordChangedEvent(userId);

      // Assert
      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.password.changed');
      expect(event.userId).toBe(userId);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should set occurredOn to current date', () => {
      // Arrange
      const before = new Date();
      
      // Act
      const event = new UserPasswordChangedEvent(
        '123e4567-e89b-42d3-a456-426614174000'
      );
      const after = new Date();

      // Assert
      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should throw error if userId is empty', () => {
      // Act & Assert
      expect(() => {
        new UserPasswordChangedEvent('');
      }).toThrow('UserId is required');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation of event', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const event = new UserPasswordChangedEvent(userId);

      // Act
      const json = event.toJSON();

      // Assert
      expect(json).toEqual({
        eventName: 'user.password.changed',
        userId: userId,
        occurredOn: event.occurredOn.toISOString(),
      });
    });
  });
});