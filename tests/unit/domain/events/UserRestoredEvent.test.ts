import { UserRestoredEvent } from '../../../../src/domain/events/UserRestoredEvent';

describe('UserRestoredEvent', () => {
  describe('create', () => {
    it('should create a valid restore event', () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const restoredBy = 'admin@example.com';
      const event = new UserRestoredEvent(userId, restoredBy);

      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.restored');
      expect(event.userId).toBe(userId);
      expect(event.restoredBy).toBe(restoredBy);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create event with reason', () => {
      const event = new UserRestoredEvent(
        '123e4567-e89b-42d3-a456-426614174000',
        'admin@example.com',
        'Restored by mistake'
      );
      expect(event.reason).toBe('Restored by mistake');
    });

    it('should throw error if userId is empty', () => {
      expect(() => {
        new UserRestoredEvent('', 'admin@example.com');
      }).toThrow('UserId is required');
    });

    it('should throw error if restoredBy is empty', () => {
      expect(() => {
        new UserRestoredEvent('123e4567-e89b-42d3-a456-426614174000', '');
      }).toThrow('RestoredBy is required');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const event = new UserRestoredEvent(
        '123e4567-e89b-42d3-a456-426614174000',
        'admin@example.com',
        'Restored by mistake'
      );

      const json = event.toJSON();

      expect(json).toMatchObject({
        eventName: 'user.restored',
        userId: '123e4567-e89b-42d3-a456-426614174000',
        restoredBy: 'admin@example.com',
        reason: 'Restored by mistake',
      });
      expect(json).toHaveProperty('occurredOn');
      expect(json).toHaveProperty('metadata');
    });
  });
});