import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaAuditRepository } from '../../src/infrastructure/adapters/database/PrismaAuditRepository';
import { UserRegisteredEvent } from '../../src/domain/events/UserRegisteredEvent';
import { UserDeletedEvent } from '../../src/domain/events/UserDeletedEvent';
import { UserPasswordChangedEvent } from '../../src/domain/events/UserPasswordChangedEvent';

describe('PrismaAuditRepository Integration Tests', () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  
  const prisma = new PrismaClient({ adapter });
  const repository = new PrismaAuditRepository(prisma);

  beforeEach(async () => {
    await prisma.domainEvent.deleteMany();
    await prisma.loginAttempt.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('save', () => {
    it('should save a domain event', async () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const event = new UserRegisteredEvent(
        userId,
        'test@example.com',
        'Test User',
        'USER'
      );

      await repository.save(event);

      const saved = await prisma.domainEvent.findFirst({
        where: { aggregateId: userId },
      });

      expect(saved).toBeDefined();
      expect(saved?.eventName).toBe('user.registered');
      expect(saved?.aggregateType).toBe('User');
      expect(saved?.eventData).toBeDefined();
    });
  });

  describe('saveMany', () => {
    it('should save multiple domain events', async () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const events = [
        new UserRegisteredEvent(userId, 'test@example.com', 'Test User', 'USER'),
        new UserPasswordChangedEvent(userId, 'admin@example.com'),
        new UserDeletedEvent(userId, 'admin@example.com', 'Test deletion'),
      ];

      await repository.saveMany(events);

      const saved = await prisma.domainEvent.findMany({
        where: { aggregateId: userId },
      });

      expect(saved).toHaveLength(3);
      expect(saved.map(e => e.eventName)).toContain('user.registered');
      expect(saved.map(e => e.eventName)).toContain('user.password.changed');
      expect(saved.map(e => e.eventName)).toContain('user.deleted');
    });

    it('should not fail when saving empty array', async () => {
      await prisma.domainEvent.deleteMany();
      
      await repository.saveMany([]);
      const count = await prisma.domainEvent.count();
      expect(count).toBe(0);
    });
  });

  describe('findByAggregateId', () => {
    it('should find events by aggregate ID', async () => {
      await prisma.domainEvent.deleteMany();
      await prisma.loginAttempt.deleteMany();
      await prisma.user.deleteMany();
      
      const userId1 = '123e4567-e89b-42d3-a456-426614174000';
      const userId2 = '456e7890-e89b-42d3-a456-426614174000';

      const event1 = new UserRegisteredEvent(userId1, 'test1@example.com', 'User One', 'USER');
      const event2 = new UserRegisteredEvent(userId2, 'test2@example.com', 'User Two', 'USER');

      await repository.save(event1);
      await repository.save(event2);

      const found = await repository.findByAggregateId(userId1);
      
      expect(found).toHaveLength(1);
      expect(found[0].eventName).toBe('user.registered');
    });
  });

  describe('findByEventName', () => {
    it('should find events by event name', async () => {
      await prisma.domainEvent.deleteMany();
      
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const event1 = new UserRegisteredEvent(userId, 'test@example.com', 'Test User', 'USER');
      const event2 = new UserDeletedEvent(userId, 'admin@example.com', 'Test deletion');

      await repository.save(event1);
      await repository.save(event2);

      const found = await repository.findByEventName('user.registered');

      expect(found.length).toBeGreaterThan(0);
      expect(found[0].eventName).toBe('user.registered');
      
      const hasOtherEvents = found.some(e => e.eventName !== 'user.registered');
      expect(hasOtherEvents).toBe(false);
    });
  });

  describe('findByDateRange', () => {
    it('should find events within date range', async () => {
      await prisma.domainEvent.deleteMany();
      await prisma.loginAttempt.deleteMany();
      await prisma.user.deleteMany();
      
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      
      const now = new Date();
      
      const event1 = new UserRegisteredEvent(userId, 'test@example.com', 'Test User', 'USER');
      
      Object.defineProperty(event1, 'occurredOn', {
        value: new Date(now.getTime() - 5000),
        writable: false
      });

      await new Promise(resolve => setTimeout(resolve, 10));
      
      const event2 = new UserDeletedEvent(userId, 'admin@example.com', 'Test deletion');
      Object.defineProperty(event2, 'occurredOn', {
        value: new Date(now.getTime() - 2000),
        writable: false
      });

      await repository.save(event1);
      await repository.save(event2);

      const startDate = new Date(now.getTime() - 10000);
      const endDate = new Date(now.getTime() + 10000);

      const found = await repository.findByDateRange(startDate, endDate);

      const filtered = found.filter(e => 
        e.eventName === 'user.registered' || e.eventName === 'user.deleted'
      );
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(e => e.eventName)).toContain('user.registered');
      expect(filtered.map(e => e.eventName)).toContain('user.deleted');

      const hasExtraEvent = filtered.some(e => e.eventName === 'user.login.attempted');
      expect(hasExtraEvent).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should find all events with pagination', async () => {
      await prisma.domainEvent.deleteMany();
      
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      
      for (let i = 0; i < 5; i++) {
        const event = new UserRegisteredEvent(
          userId,
          `test${i}@example.com`,
          `User ${i}`,
          'USER'
        );
        await repository.save(event);
      }

      const all = await repository.findAll(3, 0);
      expect(all).toHaveLength(3);

      const next = await repository.findAll(3, 3);
      expect(next).toHaveLength(2);
    });
  });

  describe('getEventCountByType', () => {
    it('should count events by type', async () => {
      await prisma.domainEvent.deleteMany();
      await prisma.loginAttempt.deleteMany();
      await prisma.user.deleteMany();
      
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      
      const event1 = new UserRegisteredEvent(userId, 'test@example.com', 'Test User', 'USER');
      const event2 = new UserDeletedEvent(userId, 'admin@example.com', 'Test deletion');
      const event3 = new UserPasswordChangedEvent(userId, 'admin@example.com');

      await repository.save(event1);
      await repository.save(event2);
      await repository.save(event3);

      const counts = await repository.getEventCountByType();
      
      expect(counts['user.registered']).toBe(1);
      expect(counts['user.deleted']).toBe(1);
      expect(counts['user.password.changed']).toBe(1);
    });
  });
});