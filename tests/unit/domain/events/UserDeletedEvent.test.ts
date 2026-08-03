import { UserDeletedEvent } from '../../../../src/domain/events/UserDeletedEvent';

describe('UserDeletedEvent', () => {
  describe('create', () => {
    it('should create a valid UserDeletedEvent', () => {
      // Arrange
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const deletedBy = 'admin@example.com';
      const reason = 'User requested deletion';

      // Act
      const event = new UserDeletedEvent(userId, deletedBy, reason);

      // Assert
      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.deleted');
      expect(event.userId).toBe(userId);
      expect(event.deletedBy).toBe(deletedBy);
      expect(event.reason).toBe(reason);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should set occurredOn to current date', () => {
      // Arrange
      const before = new Date();
      
      // Act
      const event = new UserDeletedEvent(
        '123e4567-e89b-42d3-a456-426614174000',
        'admin@example.com',
        'User requested deletion'
      );
      const after = new Date();

      // Assert
      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should throw error if userId is empty', () => {
      // Act & Assert
      expect(() => {
        new UserDeletedEvent('', 'admin@example.com', 'User requested deletion');
      }).toThrow('UserId is required');
    });

    it('should throw error if deletedBy is empty', () => {
      // Act & Assert
      expect(() => {
        new UserDeletedEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          '',
          'User requested deletion'
        );
      }).toThrow('DeletedBy is required');
    });

    it('should throw error if reason is empty', () => {
      // Act & Assert
      expect(() => {
        new UserDeletedEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          'admin@example.com',
          ''
        );
      }).toThrow('Reason is required');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation of event', () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const deletedBy = 'admin@example.com';
      const reason = 'User requested deletion';
      const event = new UserDeletedEvent(userId, deletedBy, reason);

      const json = event.toJSON();

      expect(json).toEqual({
        eventName: 'user.deleted',
        userId: userId,
        deletedBy: deletedBy,
        reason: reason,
        permanent: false, // ✅ Añadir
        metadata: null,   // ✅ Añadir
        occurredOn: event.occurredOn.toISOString(),
      });
    });
  });
});