import { UserEmailVerifiedEvent } from '../../../../src/domain/events/UserEmailVerifiedEvent';

describe('UserEmailVerifiedEvent', () => {
  describe('create', () => {
    it('should create a valid UserEmailVerifiedEvent', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';

      // Act
      const event = new UserEmailVerifiedEvent(userId, email);

      // Assert
      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.email.verified');
      expect(event.userId).toBe(userId);
      expect(event.email).toBe(email);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should set occurredOn to current date', () => {
      // Arrange
      const before = new Date();
      
      // Act
      const event = new UserEmailVerifiedEvent(
        '123e4567-e89b-42d3-a456-426614174000',
        'test@example.com'
      );
      const after = new Date();

      // Assert
      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should throw error if userId is empty', () => {
      // Act & Assert
      expect(() => {
        new UserEmailVerifiedEvent('', 'test@example.com');
      }).toThrow('UserId is required');
    });

    it('should throw error if email is empty', () => {
      // Act & Assert
      expect(() => {
        new UserEmailVerifiedEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          ''
        );
      }).toThrow('Email is required');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation of event', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';
      const event = new UserEmailVerifiedEvent(userId, email);

      // Act
      const json = event.toJSON();

      // Assert
      expect(json).toEqual({
        eventName: 'user.email.verified',
        userId: userId,
        email: email,
        verifiedBy: 'user', 
        metadata: null,     
        occurredOn: event.occurredOn.toISOString(),
      });
    });
  });
});