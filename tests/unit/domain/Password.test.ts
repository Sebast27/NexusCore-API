import { Password } from '../../../src/domain/value-objects/Password';

describe('Password Value Object', () => {
    describe('create', () => {
        it('Must have a minimum 8 characters', () =>{
            // Areange
            const validPassword = 'Password1#';

            // Act
            const password = Password.create(validPassword);

            // Assert
            expect(password.getValue()).toBe(validPassword);
        });

        it('Should throw error for password shorter than 8 characters', () => {
            // Arrange
            const shortPassword = 'Passw1'

            // Act $ Assert
            expect(() => Password.create(shortPassword)).toThrow(
                'Password must be at least 8 characters long'
            )
        });

        it('Should throw error for password without uppercase letter', () => {
            // Arrange
            const noUppercase = 'password123#'

            // Act $ Assert
            expect(() => Password.create(noUppercase)).toThrow(
                'Password must contain at least one uppercase letter'
            )
        });

        it('Should throw error for password without lowercase letter', () => {
            // Arrange
            const noLowercase = 'PASSWORD123#'

            // Act $ Assert
            expect(() => Password.create(noLowercase)).toThrow(
                'Password must contain at least one lowercase letter'
            )
        });

        it('Shoul throw error for password without number', () => {
            // Arrange
            const noNumber = 'Pasword#'

            // Act $ Assert
            expect(() => Password.create(noNumber)).toThrow(
                'Password must contain at least one number'
            )
        });

        it('Shoul throw error for password without one special character', () => {
            // Arrange
            const noSpecial = 'Pasword123'

            // Act $ Assert
            expect(() => Password.create(noSpecial)).toThrow(
                'Password must contain at least one special character'
            )
        });
    });

    describe('hash', () => {
        it('Should return a hashed password', async () => {
            // Arrange
            const password = Password.create('Password123#')

            // Act
            const hashed = await password.hash();

            // Assert
            expect(hashed).toBeDefined();
            expect(hashed).not.toBe('Password123#');
            expect(hashed.length).toBeGreaterThan(20);
        });
    });

    describe('compare', () => {
        it('Should return true for matching password', async () => {
            // Arrange
            const password = Password.create('Password123#');
            const hashed = await password.hash();

            // Act 
            const isValid = await Password.compare('Password123#', hashed);
            
            // Assert
            expect(isValid).toBe(true);
        });

        it('Should return false for non-matching password', async () => {
            // Arrange
            const password = Password.create('Password123#');
            const hashed = await password.hash();

            // Act 
            const isValid = await Password.compare('Password1234#', hashed);
            
            // Assert
            expect(isValid).toBe(false);
        });
    });
});