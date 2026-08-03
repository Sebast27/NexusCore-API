import { UserPasswordChangedEvent } from '../../../../src/domain/events/UserPasswordChangedEvent';

describe('UserPasswordChangedEvent', () => {
  describe('create', () => {
    it('should create a valid UserPasswordChangedEvent', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const changedBy = 'admin@example.com';

      // Act
      const event = new UserPasswordChangedEvent(userId, changedBy);

      // Assert
      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.password.changed');
      expect(event.userId).toBe(userId);
      expect(event.changedBy).toBe(changedBy);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should set occurredOn to current date', () => {
      // Arrange
      const before = new Date();
      
      // Act
      const event = new UserPasswordChangedEvent(
        '123e4567-e89b-42d3-a456-426614174000',
        'admin@example.com' 
      );
      const after = new Date();

      // Assert
      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should throw error if userId is empty', () => {
      // Arrange
      const userId = '';
      const changedBy = 'admin@example.com';

      // Act & Assert
      expect(() => {
        new UserPasswordChangedEvent(userId, changedBy);
      }).toThrow('UserId is required');
    });

    it('should throw error if changedBy is empty', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const changedBy = '';

      // Act & Assert
      expect(() => {
        new UserPasswordChangedEvent(userId, changedBy);
      }).toThrow('ChangedBy is required');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation of event', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const changedBy = 'admin@example.com';
      const event = new UserPasswordChangedEvent(userId, changedBy);

      // Act
      const json = event.toJSON();

      // Assert
      expect(json).toEqual({
        eventName: 'user.password.changed',
        userId: userId,
        changedBy: changedBy,
        changedReason: null, 
        metadata: null,      
        occurredOn: event.occurredOn.toISOString(),
      });
    });
  });
});