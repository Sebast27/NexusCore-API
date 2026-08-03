import { HashedPassword } from '../../../src/domain/value-objects/HashedPassword';
import { PlainPassword } from '../../../src/domain/value-objects/PlainPassword';

describe('HashedPassword', () => {
  describe('fromHash', () => {
    it('should create from valid bcrypt hash', async () => {
      const plain = PlainPassword.create('Password1!');
      const hash = await plain.hash();
      
      const hashed = HashedPassword.fromHash(hash.getValue());
      expect(hashed).toBeInstanceOf(HashedPassword);
      expect(hashed.getValue()).toBe(hash.getValue());
    });

    it('should throw error for invalid hash format', () => {
      expect(() => HashedPassword.fromHash('invalid')).toThrow(
        'Invalid bcrypt hash format'
      );
    });

    it('should throw error for empty hash', () => {
      expect(() => HashedPassword.fromHash('')).toThrow(
        'Hashed password cannot be empty'
      );
    });
  });

  describe('verify', () => {
    it('should verify password correctly', async () => {
      const plain = PlainPassword.create('Password1!');
      const hash = await plain.hash();
      
      const isValid = await hash.verify(plain);
      expect(isValid).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const plain = PlainPassword.create('Password1!');
      const hash = await plain.hash();
      
      const wrong = PlainPassword.create('Password2!');
      const isValid = await hash.verify(wrong);
      expect(isValid).toBe(false);
    });
  });
});