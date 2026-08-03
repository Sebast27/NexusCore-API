import { UserRoleChangedEvent } from '../../../../src/domain/events/UserRoleChangedEvent';

describe('UserRoleChangedEvent', () => {
  describe('create', () => {
    it('should create a valid role change event', () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const oldRole = 'USER';
      const newRole = 'ADMIN';
      const changedBy = 'admin@example.com';
      const event = new UserRoleChangedEvent(userId, oldRole, newRole, changedBy);

      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.role.changed');
      expect(event.userId).toBe(userId);
      expect(event.oldRole).toBe(oldRole);
      expect(event.newRole).toBe(newRole);
      expect(event.changedBy).toBe(changedBy);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create event with reason', () => {
      const event = new UserRoleChangedEvent(
        '123e4567-e89b-42d3-a456-426614174000',
        'USER',
        'ADMIN',
        'admin@example.com',
        'Promotion'
      );
      expect(event.reason).toBe('Promotion');
    });

    it('should throw error if userId is empty', () => {
      expect(() => {
        new UserRoleChangedEvent('', 'USER', 'ADMIN', 'admin@example.com');
      }).toThrow('UserId is required');
    });

    it('should throw error if oldRole is empty', () => {
      expect(() => {
        new UserRoleChangedEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          '',
          'ADMIN',
          'admin@example.com'
        );
      }).toThrow('OldRole is required');
    });

    it('should throw error if newRole is empty', () => {
      expect(() => {
        new UserRoleChangedEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          'USER',
          '',
          'admin@example.com'
        );
      }).toThrow('NewRole is required');
    });

    it('should throw error if changedBy is empty', () => {
      expect(() => {
        new UserRoleChangedEvent(
          '123e4567-e89b-42d3-a456-426614174000',
          'USER',
          'ADMIN',
          ''
        );
      }).toThrow('ChangedBy is required');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const event = new UserRoleChangedEvent(
        '123e4567-e89b-42d3-a456-426614174000',
        'USER',
        'ADMIN',
        'admin@example.com',
        'Promotion'
      );

      const json = event.toJSON();

      expect(json).toMatchObject({
        eventName: 'user.role.changed',
        userId: '123e4567-e89b-42d3-a456-426614174000',
        oldRole: 'USER',
        newRole: 'ADMIN',
        changedBy: 'admin@example.com',
        reason: 'Promotion',
      });
      expect(json).toHaveProperty('occurredOn');
      expect(json).toHaveProperty('metadata');
    });
  });
});