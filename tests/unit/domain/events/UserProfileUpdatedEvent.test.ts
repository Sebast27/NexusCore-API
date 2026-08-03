import { UserProfileUpdatedEvent } from '../../../../src/domain/events/UserProfileUpdatedEvent';

describe('UserProfileUpdatedEvent', () => {
  describe('create', () => {
    it('should create a valid profile updated event', () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const oldName = 'Old Name';
      const newName = 'New Name';
      const updatedBy = 'user@example.com';

      const event = new UserProfileUpdatedEvent(
        userId,
        oldName,
        newName,
        undefined,
        undefined,
        updatedBy
      );

      expect(event).toBeDefined();
      expect(event.eventName).toBe('user.profile.updated');
      expect(event.userId).toBe(userId);
      expect(event.oldName).toBe(oldName);
      expect(event.newName).toBe(newName);
      expect(event.updatedBy).toBe(updatedBy);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create event with email changes', () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const oldName = 'Old Name';
      const newName = 'New Name';
      const oldEmail = 'old@example.com';
      const newEmail = 'new@example.com';
      const updatedBy = 'user@example.com';

      const event = new UserProfileUpdatedEvent(
        userId,
        oldName,
        newName,
        oldEmail,
        newEmail,
        updatedBy
      );

      expect(event.oldEmail).toBe(oldEmail);
      expect(event.newEmail).toBe(newEmail);
    });

    it('should throw error if userId is empty', () => {
      expect(() => {
        new UserProfileUpdatedEvent('', 'Old Name', 'New Name', undefined, undefined, 'user@example.com');
      }).toThrow('UserId is required');
    });

    it('should throw error if oldName is empty', () => {
      expect(() => {
        new UserProfileUpdatedEvent('123e4567-e89b-42d3-a456-426614174000', '', 'New Name', undefined, undefined, 'user@example.com');
      }).toThrow('OldName is required');
    });

    it('should throw error if newName is empty', () => {
      expect(() => {
        new UserProfileUpdatedEvent('123e4567-e89b-42d3-a456-426614174000', 'Old Name', '', undefined, undefined, 'user@example.com');
      }).toThrow('NewName is required');
    });

    it('should throw error if updatedBy is empty', () => {
      expect(() => {
        new UserProfileUpdatedEvent('123e4567-e89b-42d3-a456-426614174000', 'Old Name', 'New Name', undefined, undefined, '');
      }).toThrow('UpdatedBy is required');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const oldName = 'Old Name';
      const newName = 'New Name';
      const updatedBy = 'user@example.com';

      const event = new UserProfileUpdatedEvent(userId, oldName, newName, undefined, undefined, updatedBy);

      const json = event.toJSON();

      expect(json).toMatchObject({
        eventName: 'user.profile.updated',
        userId: userId,
        oldName: oldName,
        newName: newName,
        oldEmail: null,
        newEmail: null,
        updatedBy: updatedBy,
        metadata: null,
      });
      expect(json).toHaveProperty('occurredOn');
    });
  });
});