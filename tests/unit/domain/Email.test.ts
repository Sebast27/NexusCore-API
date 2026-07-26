import { Email } from '../../../src/domain/value-objects/Email';

describe('Email Value Objetcs', () => {
    describe('create', () => {
        it('Should create a valid email', () => {
            // Arrange
            const validEmail = 'test@example.com'

            // Act   
            const email = Email.create(validEmail);
            
            // Assert
            expect(email.getValue()).toBe(validEmail);
        });

        it('Should throw an error for invalid email (without @)', () =>{
            // Arrange
            const invalidEmail = 'testexample.com'

            // Act $ Assert
            expect(() => Email.create(invalidEmail)).toThrow('Invalid email format');
        });

        it('Should throw an error for empty email', () => {
            // Arrange
            const emptyEmail = ''

            // Act $ Assert
            expect(() => Email.create(emptyEmail)).toThrow('Email cannot be empty');
        });

        it('Should normalize email to Lowercase', () => {
            // Arrange
            const emailWithUppercase = 'TEST@GMAIL.COM'

            // Act
            const email = Email.create(emailWithUppercase);

            // Assert
            expect(email.getValue()).toBe(emailWithUppercase.toLowerCase());
        });
    });

    describe('equals', () => {
        it('Should return true for equal emails', () => {
            // Arrange
            const email1 = Email.create('test@example.com');
            const email2 = Email.create('test@example.com');

            // Act $ Assert\
            expect(email1.equals(email2)).toBe(true);
        });

        it('Should return false for diferent emails', () => {
            // Arrange
            const email1 = Email.create('test1@example.com');
            const email2 = Email.create('test2@example.com');

            // Act $ Assert
            expect(email1.equals(email2)).toBe(false);
        });
    });
});