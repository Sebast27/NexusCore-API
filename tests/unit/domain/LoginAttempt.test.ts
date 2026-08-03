import { LoginAttempt } from '../../../src/domain/entities/LoginAttempt';
import { Email } from '../../../src/domain/value-objects/Email';
import { IpAddress } from '../../../src/domain/value-objects/IpAddress';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { UserLoginAttemptedEvent } from '../../../src/domain/events/UserLoginAttemptedEvent';
import { LoginAttemptId } from '../../../src/domain/value-objects/LoginAttemptId';

describe('LoginAttempt', () => {
  describe('createSuccessful', () => {
    it('should create a successful login attempt', () => {
      const email = Email.create('test@example.com');
      const ip = IpAddress.create('192.168.1.1');
      const userId = UserId.create();

      const attempt = LoginAttempt.createSuccessful(email, ip, userId);

      expect(attempt).toBeDefined();
      expect(attempt.getId()).toBeDefined();
      expect(attempt.getEmail()).toBe(email);
      expect(attempt.getIpAddress()).toBe(ip);
      expect(attempt.isSuccess()).toBe(true);
      expect(attempt.getUserId()).toBe(userId);
      expect(attempt.getAttemptedAt()).toBeInstanceOf(Date);
    });

    it('should emit UserLoginAttemptedEvent', () => {
      const email = Email.create('test@example.com');
      const ip = IpAddress.create('192.168.1.1');
      const userId = UserId.create();

      const attempt = LoginAttempt.createSuccessful(email, ip, userId);
      const events = attempt.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserLoginAttemptedEvent);
      expect(events[0].eventName).toBe('user.login.attempted');
    });
  });

  describe('createFailed', () => {
    it('should create a failed login attempt', () => {
      const email = Email.create('test@example.com');
      const ip = IpAddress.create('192.168.1.1');
      const reason = 'Invalid password';

      const attempt = LoginAttempt.createFailed(email, ip, reason);

      expect(attempt).toBeDefined();
      expect(attempt.isSuccess()).toBe(false);
      expect(attempt.getFailureReason()).toBe(reason);
      expect(attempt.getUserId()).toBeUndefined();
    });

    it('should create failed attempt with userId when provided', () => {
      const email = Email.create('test@example.com');
      const ip = IpAddress.create('192.168.1.1');
      const userId = UserId.create();
      const reason = 'Invalid password';

      const attempt = LoginAttempt.createFailed(email, ip, reason, userId);

      expect(attempt.getUserId()).toBe(userId);
    });
  });

  describe('getEvents', () => {
    it('should return events and clear them', () => {
      const email = Email.create('test@example.com');
      const ip = IpAddress.create('192.168.1.1');
      const userId = UserId.create();

      const attempt = LoginAttempt.createSuccessful(email, ip, userId);
      
      expect(attempt.getEvents()).toHaveLength(1);
      
      attempt.clearEvents();
      expect(attempt.getEvents()).toHaveLength(0);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a LoginAttempt from persistence', () => {
      const id = LoginAttemptId.create();
      const email = Email.create('test@example.com');
      const ip = IpAddress.create('192.168.1.1');
      const userId = UserId.create();
      const attemptedAt = new Date();

      const attempt = LoginAttempt.reconstitute(
        id,
        email,
        ip,
        true,
        userId,
        'Mozilla/5.0',
        undefined,
        attemptedAt
      );

      expect(attempt.getId()).toBe(id);
      expect(attempt.getEmail()).toBe(email);
      expect(attempt.getIpAddress()).toBe(ip);
      expect(attempt.isSuccess()).toBe(true);
      expect(attempt.getUserId()).toBe(userId);
      expect(attempt.getUserAgent()).toBe('Mozilla/5.0');
      expect(attempt.getAttemptedAt()).toBe(attemptedAt);
    });
  });
});