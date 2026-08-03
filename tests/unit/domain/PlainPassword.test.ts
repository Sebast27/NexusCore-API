import { PlainPassword } from '../../../src/domain/value-objects/PlainPassword';
import { HashedPassword } from '../../../src/domain/value-objects/HashedPassword';

describe('PlainPassword', () => {
  describe('create', () => {
    it('should create a valid password', () => {
      const password = PlainPassword.create('Password1!');
      expect(password).toBeInstanceOf(PlainPassword);
    });

    it('should throw error if password is too short', () => {
      expect(() => PlainPassword.create('Pass1!')).toThrow(
        'at least 8 characters'
      );
    });

    it('should throw error if no uppercase', () => {
      expect(() => PlainPassword.create('password1!')).toThrow(
        'uppercase letter'
      );
    });

    it('should throw error if no lowercase', () => {
      expect(() => PlainPassword.create('PASSWORD1!')).toThrow(
        'lowercase letter'
      );
    });

    it('should throw error if no number', () => {
      expect(() => PlainPassword.create('Password!')).toThrow(
        'number'
      );
    });

    it('should throw error if no special character', () => {
      expect(() => PlainPassword.create('Password1')).toThrow(
        'special character'
      );
    });
  });

  describe('hash', () => {
    it('should return HashedPassword', async () => {
      const plain = PlainPassword.create('Password1!');
      const hashed = await plain.hash();
      
      expect(hashed).toBeInstanceOf(HashedPassword);
      expect(hashed.getValue()).not.toBe('Password1!');
      expect(hashed.getValue()).toMatch(/^\$2[aby]\$\d+\$.+$/);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const plain = PlainPassword.create('Password1!');
      const hashed = await plain.hash();
      
      const isValid = await plain.compare(hashed);
      expect(isValid).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const plain = PlainPassword.create('Password1!');
      const hashed = await plain.hash();
      
      const wrong = PlainPassword.create('Password2!');
      const isValid = await wrong.compare(hashed);
      expect(isValid).toBe(false);
    });
  });
});