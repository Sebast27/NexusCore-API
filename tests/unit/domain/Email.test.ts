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

    describe('Email with length and TLD validation', () => {
        it('should throw error if email exceeds 254 characters', () => {
            const longEmail = 'a'.repeat(250) + '@example.com';
            expect(() => Email.create(longEmail)).toThrow(
            'exceeds maximum length of 254'
            );
        });

        it('should throw error if TLD is too short', () => {
            expect(() => Email.create('user@domain.c')).toThrow(
            'TLD must be at least 2 characters'
            );
        });

        it('should throw error if domain has no dot', () => {
            expect(() => Email.create('user@domain')).toThrow(
            'domain must contain a dot'
            );
        });

        it('should throw error if domain has invalid characters', () => {
            expect(() => Email.create('user@domain!.com')).toThrow(
            'invalid characters'
            );
        });

        it('should accept valid email with plus sign', () => {
            const email = Email.create('user+filter@gmail.com');
            expect(email.getValue()).toBe('user+filter@gmail.com');
        });

        it('should accept valid email with subdomain', () => {
            const email = Email.create('user@sub.domain.com');
            expect(email.getValue()).toBe('user@sub.domain.com');
        });

        it('should get domain from email', () => {
            const email = Email.create('test@example.com');
            expect(email.getDomain()).toBe('example.com');
        });

        it('should get local part from email', () => {
            const email = Email.create('test@example.com');
            expect(email.getLocalPart()).toBe('test');
        });
    });
});