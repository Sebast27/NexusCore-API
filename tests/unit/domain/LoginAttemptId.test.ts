import { LoginAttemptId } from '../../../src/domain/value-objects/LoginAttemptId';

describe('LoginAttemptId', () => {
  describe('create', () => {
    it('should create a valid ID', () => {
      const id = LoginAttemptId.create();
      expect(id.getValue()).toBeDefined();
      expect(id.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });
  });

  describe('fromString', () => {
    it('should create from valid UUID', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const id = LoginAttemptId.fromString(uuid);
      expect(id.getValue()).toBe(uuid);
    });

    it('should throw error for empty string', () => {
      expect(() => LoginAttemptId.fromString('')).toThrow(
        'LoginAttemptId cannot be empty'
      );
    });
  });

  describe('equals', () => {
    it('should return true for same ID', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const id1 = LoginAttemptId.fromString(uuid);
      const id2 = LoginAttemptId.fromString(uuid);
      expect(id1.equals(id2)).toBe(true);
    });
  });
});