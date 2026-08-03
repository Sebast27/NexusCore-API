import { Name } from '../../../src/domain/value-objects/Name';

describe('Name Value Object', () => {
  it('should create a valid name', () => {
    const name = Name.create('juan perez');
    expect(name.getValue()).toBe('Juan Perez');
  });

  it('should throw error if name is empty', () => {
    expect(() => Name.create('')).toThrow('Name cannot be empty');
    expect(() => Name.create('   ')).toThrow('Name cannot be empty');
  });

  it('should throw error if name is too short', () => {
    expect(() => Name.create('a')).toThrow('at least 2 characters');
  });

  it('should throw error if name is too long', () => {
    const longName = 'a'.repeat(101);
    expect(() => Name.create(longName)).toThrow('cannot exceed 100 characters');
  });

  it('should throw error if name has invalid characters', () => {
    expect(() => Name.create('Juan123')).toThrow('invalid characters');
    expect(() => Name.create('Juan@')).toThrow('invalid characters');
  });

  it('should format name correctly', () => {
    const name = Name.create('juan carlos pérez');
    expect(name.getValue()).toBe('Juan Carlos Pérez');
  });

  it('should get initials', () => {
    const name = Name.create('Juan Carlos Pérez');
    expect(name.getInitials()).toBe('JC');
  });

  it('should get first name', () => {
    const name = Name.create('Juan Carlos Pérez');
    expect(name.getFirstName()).toBe('Juan');
  });

  it('should get last name', () => {
    const name = Name.create('Juan Carlos Pérez');
    expect(name.getLastName()).toBe('Carlos Pérez');
  });

  describe('Name with special characters', () => {
    it('should accept names with apostrophe', () => {
      const name = Name.create("O'Connor");
      expect(name.getValue()).toBe("O'Connor");
    });

    it('should capitalize names with apostrophe correctly', () => {
      const name = Name.create("o'connor");
      expect(name.getValue()).toBe("O'Connor");
    });

    it('should accept names with hyphen', () => {
      const name = Name.create("Jean-Luc");
      expect(name.getValue()).toBe("Jean-Luc");
    });

    it('should capitalize names with hyphen correctly', () => {
      const name = Name.create("jean-luc");
      expect(name.getValue()).toBe("Jean-Luc");
    });

    it('should accept names with period', () => {
      const name = Name.create("J.R.R. Tolkien");
      expect(name.getValue()).toBe("J.R.R. Tolkien");
    });

    it('should handle mixed special characters', () => {
      const name = Name.create("jean-luc o'connor");
      expect(name.getValue()).toBe("Jean-Luc O'Connor");
    });

    it('should throw error for names with only special characters', () => {
      expect(() => Name.create("---")).toThrow('must contain at least one letter');
      expect(() => Name.create("'''")).toThrow('must contain at least one letter');
    });

    it('should throw error for names with invalid characters', () => {
      expect(() => Name.create("Juan@123")).toThrow('invalid characters');
      expect(() => Name.create("Maria#")).toThrow('invalid characters');
    });
  });
});