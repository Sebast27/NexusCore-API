import { UserLoggedInEvent } from '../../../../src/domain/events/UserLoggedInEvent';

describe('UserLoggedInEvent', () => {
  describe('create', () => {
    it('should create a valid login success event', () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';
      const event = new UserLoggedInEvent(userId, email, true);

      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.logged.in');
      expect(event.userId).toBe(userId);
      expect(event.email).toBe(email);
      expect(event.success).toBe(true);
      expect(event.failureReason).toBeUndefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create a valid login failure event', () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';
      const reason = 'Invalid password';
      const event = new UserLoggedInEvent(userId, email, false, reason);

      expect(event.success).toBe(false);
      expect(event.failureReason).toBe(reason);
    });

    it('should throw error if userId is empty', () => {
      expect(() => {
        new UserLoggedInEvent('', 'test@example.com', true);
      }).toThrow('UserId is required');
    });

    it('should throw error if email is empty', () => {
      expect(() => {
        new UserLoggedInEvent('123e4567-e89b-42d3-a456-426614174000', '', true);
      }).toThrow('Email is required');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';
      const event = new UserLoggedInEvent(userId, email, true);

      const json = event.toJSON();

      expect(json).toMatchObject({
        eventName: 'user.logged.in',
        userId: userId,
        email: email,
        success: true,
        failureReason: null,
      });
      expect(json).toHaveProperty('occurredOn');
      expect(json).toHaveProperty('metadata');
    });
  });
});