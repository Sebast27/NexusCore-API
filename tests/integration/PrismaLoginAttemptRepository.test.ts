import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaLoginAttemptRepository } from '../../src/infrastructure/adapters/database/PrismaLoginAttemptRepository';
import { LoginAttempt } from '../../src/domain/entities/LoginAttempt';
import { Email } from '../../src/domain/value-objects/Email';
import { IpAddress } from '../../src/domain/value-objects/IpAddress';
import { UserId } from '../../src/domain/value-objects/UserId';

describe('PrismaLoginAttemptRepository Integration Tests', () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  
  const prisma = new PrismaClient({ adapter });
  const repository = new PrismaLoginAttemptRepository(prisma);

  beforeEach(async () => {
    await prisma.loginAttempt.deleteMany();
    await prisma.domainEvent.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('save', () => {
    it('should save a login attempt', async () => {
      const email = Email.create('test@example.com');
      const ip = IpAddress.create('192.168.1.1');
      const userId = UserId.create();

      const attempt = LoginAttempt.createSuccessful(email, ip, userId);
      await repository.save(attempt);

      // ✅ Buscar por email en lugar de id
      const saved = await prisma.loginAttempt.findFirst({
        where: { email: email.getValue() },
      });

      expect(saved).toBeDefined();
      expect(saved?.email).toBe(email.getValue());
      expect(saved?.ipAddress).toBe(ip.getValue());
      expect(saved?.success).toBe(true);
    });

    it('should save domain events with the attempt', async () => {
      const email = Email.create('test@example.com');
      const ip = IpAddress.create('192.168.1.1');
      const userId = UserId.create();

      const attempt = LoginAttempt.createSuccessful(email, ip, userId);
      await repository.save(attempt);

      const events = await prisma.domainEvent.findMany({
        where: { aggregateId: attempt.getId().getValue() },
      });

      // ✅ Verificar que hay al menos un evento
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].eventName).toBe('user.login.attempted');
    });
  });

  describe('findByEmail', () => {
    it('should find attempts by email', async () => {
      await prisma.loginAttempt.deleteMany();
      
      const email = Email.create('test@example.com');
      const ip = IpAddress.create('192.168.1.1');
      const userId = UserId.create();

      const attempt = LoginAttempt.createSuccessful(email, ip, userId);
      await repository.save(attempt);

      const found = await repository.findByEmail(email);

      expect(found).toHaveLength(1);
      expect(found[0].getEmail().getValue()).toBe(email.getValue());
    });
  });

  describe('getRecentFailures', () => {
    it('should count recent failed attempts', async () => {
      await prisma.loginAttempt.deleteMany();
      await prisma.domainEvent.deleteMany();
      
      const email = Email.create('test@example.com');
      const ip = IpAddress.create('192.168.1.1');

      const failed1 = LoginAttempt.createFailed(email, ip, 'Invalid password');
      const failed2 = LoginAttempt.createFailed(email, ip, 'Invalid password');
      await repository.save(failed1);
      await repository.save(failed2);

      const count = await repository.getRecentFailures(email, 5);
      expect(count).toBe(2);
    });
  });
});