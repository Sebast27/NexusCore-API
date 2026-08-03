import { PlainPassword } from '../../../src/domain/value-objects/PlainPassword';
import { HashedPassword } from '../../../src/domain/value-objects/HashedPassword';

describe('Password Value Object', () => {
    describe('create', () => {
        it('Must have a minimum 8 characters', () =>{
            // Areange
            const validPassword = 'Password1#';

            // Act
            const password = PlainPassword.create(validPassword);

            // Assert
            expect(password).toBeInstanceOf(PlainPassword);
        });

        it('Should throw error for password shorter than 8 characters', () => {
            // Arrange
            const shortPassword = 'Passw1'

            // Act $ Assert
            expect(() => PlainPassword.create(shortPassword)).toThrow(
                'Password must be at least 8 characters long'
            )
        });

        it('Should throw error for password without uppercase letter', () => {
            // Arrange
            const noUppercase = 'password123#'

            // Act $ Assert
            expect(() => PlainPassword.create(noUppercase)).toThrow(
                'Password must contain at least one uppercase letter'
            )
        });

        it('Should throw error for password without lowercase letter', () => {
            // Arrange
            const noLowercase = 'PASSWORD123#'

            // Act $ Assert
            expect(() => PlainPassword.create(noLowercase)).toThrow(
                'Password must contain at least one lowercase letter'
            )
        });

        it('Shoul throw error for password without number', () => {
            // Arrange
            const noNumber = 'Pasword#'

            // Act $ Assert
            expect(() => PlainPassword.create(noNumber)).toThrow(
                'Password must contain at least one number'
            )
        });

        it('Shoul throw error for password without one special character', () => {
            // Arrange
            const noSpecial = 'Pasword123'

            // Act $ Assert
            expect(() => PlainPassword.create(noSpecial)).toThrow(
                'Password must contain at least one special character'
            )
        });
    });

    describe('hash', () => {
        it('Should return a hashed password', async () => {
            // Arrange
            const plain = PlainPassword.create('Password123#')

            // Act
            const hashed = await plain.hash();

            // Assert
            expect(hashed).toBeDefined();
            expect(hashed).not.toBe('Password123#');
            expect(hashed.getValue()).toMatch(/^\$2[aby]\$\d+\$.+$/);
        });
        it('should generate different hashes for same password', async () => {
            const plain1 = PlainPassword.create('Password1#');
            const plain2 = PlainPassword.create('Password1#');
            
            const hash1 = await plain1.hash();
            const hash2 = await plain2.hash();
            
            expect(hash1.getValue()).not.toBe(hash2.getValue());
        });
    });

    describe('compare', () => {
        it('Should return true for matching password', async () => {
            // Arrange
            const plain = PlainPassword.create('Password123#');
            const hashed = await plain.hash();

            // Act 
            const isValid = await plain.compare(hashed);
            
            // Assert
            expect(isValid).toBe(true);
        });

        it('Should return false for non-matching password', async () => {
            // Arrange
            const plain = PlainPassword.create('Password123#');
            const hashed = await plain.hash();

            // Act 
            const wrong = PlainPassword.create('Password2#');
            const isValid = await wrong.compare(hashed);
            
            // Assert
            expect(isValid).toBe(false);
        });
    });

    describe('HashedPassword Value Object', () => {
        describe('fromHash', () => {
            it('should create from valid bcrypt hash', async () => {    
            const plain = PlainPassword.create('Password1#');
            const hash = await plain.hash();
            
            const hashed = HashedPassword.fromHash(hash.getValue());
            expect(hashed).toBeInstanceOf(HashedPassword);
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
            const plain = PlainPassword.create('Password1#');
            const hash = await plain.hash();
            
            const isValid = await hash.verify(plain);
            expect(isValid).toBe(true);
            });
        });
    });
});