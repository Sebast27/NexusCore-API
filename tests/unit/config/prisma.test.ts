import { prisma } from '../../../src/infrastructure/adapters/database/prisma';

describe('Prisma Config', () => {
  it('should have prisma instance', () => {
    expect(prisma).toBeDefined();
  });

  it('should have user model', () => {
    expect(prisma.user).toBeDefined();
  });

  it('should have domainEvent model', () => {
    expect(prisma.domainEvent).toBeDefined();
  });

  it('should have loginAttempt model', () => {
    expect(prisma.loginAttempt).toBeDefined();
  });
});