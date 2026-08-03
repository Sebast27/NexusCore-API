import { UserLoginAttemptedEvent } from '../../../../src/domain/events/UserLoginAttemptedEvent';

describe('UserLoginAttemptedEvent', () => {
  describe('create', () => {
    it('should create a valid login attempt event', () => {
      const loginAttemptId = '123e4567-e89b-42d3-a456-426614174000';
      const email = 'test@example.com';
      const ipAddress = '192.168.1.1';
      const event = new UserLoginAttemptedEvent(
        loginAttemptId,
        email,
        ipAddress,
        true
      );

      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.login.attempted');
      expect(event.loginAttemptId).toBe(loginAttemptId);
      expect(event.email).toBe(email);
      expect(event.ipAddress).toBe(ipAddress);
      expect(event.success).toBe(true);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create failed login attempt event', () => {
      const event = new UserLoginAttemptedEvent(
        '123e4567-e89b-42d3-a456-426614174000',
        'test@example.com',
        '192.168.1.1',
        false,
        'Invalid password',
        'user-id-123'
      );
      expect(event.success).toBe(false);
      expect(event.failureReason).toBe('Invalid password');
      expect(event.userId).toBe('user-id-123');
    });

    it('should throw error if loginAttemptId is empty', () => {
      expect(() => {
        new UserLoginAttemptedEvent('', 'test@example.com', '192.168.1.1', true);
      }).toThrow('LoginAttemptId is required');
    });

    it('should throw error if email is empty', () => {
      expect(() => {
        new UserLoginAttemptedEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          '',
          '192.168.1.1',
          true
        );
      }).toThrow('Email is required');
    });

    it('should throw error if ipAddress is empty', () => {
      expect(() => {
        new UserLoginAttemptedEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          'test@example.com',
          '',
          true
        );
      }).toThrow('IpAddress is required');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const event = new UserLoginAttemptedEvent(
        '123e4567-e89b-42d3-a456-426614174000',
        'test@example.com',
        '192.168.1.1',
        true
      );

      const json = event.toJSON();

      expect(json).toMatchObject({
        eventName: 'user.login.attempted',
        loginAttemptId: '123e4567-e89b-42d3-a456-426614174000',
        email: 'test@example.com',
        ipAddress: '192.168.1.1',
        success: true,
        failureReason: null,
        userId: null,
      });
      expect(json).toHaveProperty('occurredOn');
      expect(json).toHaveProperty('metadata');
    });
  });
});