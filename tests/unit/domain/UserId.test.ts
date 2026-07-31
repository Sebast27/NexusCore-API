import { UserId } from '../../../src/domain/value-objects/UserId';

describe('UserId Value Object', () => {
  // UUID v4 válidos para pruebas
  const VALID_UUID_V4 = '123e4567-e89b-42d3-a456-426614174000'; 
  const ANOTHER_VALID_UUID = '987fcdeb-51a2-43d7-9abc-123456789012';

  describe('create', () => {
    it('should create a valid UserId with UUID v4 format', () => {
      const userId = UserId.create();

      expect(userId).toBeDefined();
      expect(userId.getValue()).toBeDefined();
      expect(typeof userId.getValue()).toBe('string');

      // Verificar formato UUID v4 usando la misma regex que la implementación
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(userId.getValue()).toMatch(uuidRegex);
    });

    it('should generate different IDs for different instances', () => {
      const userId1 = UserId.create();
      const userId2 = UserId.create();

      expect(userId1.getValue()).not.toBe(userId2.getValue());
    });
  });

  describe('fromString', () => {
    it('should create UserId from valid UUID string', () => {
      // Arrange - Usando UUID v4 válido
      const validUuid = VALID_UUID_V4;

      // Act
      const userId = UserId.fromString(validUuid);

      // Assert
      expect(userId).toBeDefined();
      expect(userId.getValue()).toBe(validUuid);
    });

    it('should throw error if UUID is empty', () => {
      expect(() => UserId.fromString('')).toThrow('UserId cannot be empty');
      expect(() => UserId.fromString('   ')).toThrow('UserId cannot be empty');
    });

    it('should throw error if UUID is invalid format', () => {
      const invalidUuids = [
        'not-a-uuid',
        '123e4567-e89b-12d3-a456', // muy corto
        '123e4567-e89b-12d3-a456-426614174000-extra', // muy largo
        '123e4567-e89b-12d3-xxxx-426614174000', // caracteres inválidos
        '123e4567e89b12d3a456426614174000', // sin guiones
        '123e4567-e89b-12d3-a456-426614174000', // versión 1 (no v4)
      ];

      invalidUuids.forEach((invalid) => {
        expect(() => UserId.fromString(invalid)).toThrow(
          'Invalid UUID format'
        );
      });
    });

    it('should throw error if UUID version is not 4', () => {
      // UUID versión 1 (no v4)
      const uuidV1 = '123e4567-e89b-11d3-a456-426614174000';

      expect(() => UserId.fromString(uuidV1)).toThrow(
        'Invalid UUID format'
      );
    });

    it('should throw error if UUID variant is incorrect', () => {
      // UUID con variant incorrecta (el cuarto grupo no comienza con 8,9,a,b)
      const uuidWrongVariant = '123e4567-e89b-42d3-7fff-426614174000';

      expect(() => UserId.fromString(uuidWrongVariant)).toThrow(
        'Invalid UUID format'
      );
    });

    it('should normalize UUID to lowercase', () => {
      const uuidMixedCase = '123E4567-E89B-42D3-A456-426614174000';
      const userId = UserId.fromString(uuidMixedCase);

      expect(userId.getValue()).toBe(uuidMixedCase.toLowerCase());
    });
  });

  describe('equals', () => {
    it('should return true for equal UserIds', () => {
      const uuid = VALID_UUID_V4;
      const userId1 = UserId.fromString(uuid);
      const userId2 = UserId.fromString(uuid);

      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false for different UserIds', () => {
      const userId1 = UserId.fromString(VALID_UUID_V4);
      const userId2 = UserId.fromString(ANOTHER_VALID_UUID);

      expect(userId1.equals(userId2)).toBe(false);
    });

    it('should return false when comparing with non-UserId', () => {
      const userId = UserId.fromString(VALID_UUID_V4);

      expect(userId.equals(null as any)).toBe(false);
      expect(userId.equals(undefined as any)).toBe(false);
      expect(userId.equals('some-string' as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const uuid = VALID_UUID_V4;
      const userId = UserId.fromString(uuid);

      const result = userId.toString();

      expect(result).toBe(uuid);
    });
  });

  describe('isValid', () => {
    it('should return true for valid UUID', () => {
      expect(UserId.isValid(VALID_UUID_V4)).toBe(true);
      expect(UserId.isValid(ANOTHER_VALID_UUID)).toBe(true);
    });

    it('should return false for invalid UUID', () => {
      expect(UserId.isValid('not-a-uuid')).toBe(false);
      expect(UserId.isValid('')).toBe(false);
      expect(UserId.isValid(null as any)).toBe(false);
      expect(UserId.isValid(undefined as any)).toBe(false);
      expect(UserId.isValid('123e4567-e89b-11d3-a456-426614174000')).toBe(false); // versión 1
    });
  });

  describe('edge cases', () => {
    it('should handle UUIDs with leading/trailing spaces', () => {
      const uuidWithSpaces = `  ${VALID_UUID_V4}  `;
      const userId = UserId.fromString(uuidWithSpaces);

      expect(userId.getValue()).toBe(VALID_UUID_V4);
    });

    it('should throw error for null or undefined', () => {
      expect(() => UserId.fromString(null as any)).toThrow('UserId cannot be empty');
      expect(() => UserId.fromString(undefined as any)).toThrow('UserId cannot be empty');
    });
  });
});