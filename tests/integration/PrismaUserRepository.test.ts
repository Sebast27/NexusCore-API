import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaUserRepository } from '../../src/infrastructure/adapters/database/PrismaUserRepository';
import { User } from '../../src/domain/entities/User';
import { Email } from '../../src/domain/value-objects/Email';
import { PlainPassword } from '../../src/domain/value-objects/PlainPassword'; 
import { Name } from '../../src/domain/value-objects/Name';
import { MockDateProvider } from '../mocks/MockDateProvider';

describe('PrismaUserRepository Integration Tests', () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  
  const prisma = new PrismaClient({ adapter });
  const repository = new PrismaUserRepository(prisma);
  const mockDateProvider = new MockDateProvider();

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.domainEvent.deleteMany();
    await prisma.loginAttempt.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.domainEvent.deleteMany();
    await prisma.loginAttempt.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('save', () => {
    it('should save a user to the database', async () => {

      const user = await User.create( 
        Email.create('test@example.com'),
        PlainPassword.create('SecurePass123!'),
        Name.create('Test User'),
        'USER',
        mockDateProvider
      );

      await repository.save(user);

      const savedUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(savedUser).toBeDefined();
      expect(savedUser?.email).toBe('test@example.com');
      expect(savedUser?.name).toBe('Test User');
      expect(savedUser?.role).toBe('USER');
      expect(savedUser?.deletedAt).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = await User.create( 
        Email.create('find@example.com'),
        PlainPassword.create('SecurePass123!'), 
        Name.create('Find User'),
        'USER',
        mockDateProvider 
      );
      await repository.save(user);

      const foundUser = await repository.findByEmail(Email.create('find@example.com'));

      expect(foundUser).toBeDefined();
      expect(foundUser?.getEmail().getValue()).toBe('find@example.com');
      expect(foundUser?.getName().getValue()).toBe('Find User');
    });

    it('should return null when user not found', async () => {
      const foundUser = await repository.findByEmail(Email.create('notfound@example.com'));
      expect(foundUser).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const user = await User.create( 
        Email.create('id@example.com'),
        PlainPassword.create('SecurePass123!'), 
        Name.create('Id User'),
        'USER',
        mockDateProvider 
      );
      await repository.save(user);

      const foundUser = await repository.findById(user.getId());

      expect(foundUser).toBeDefined();
      expect(foundUser?.getId().getValue()).toBe(user.getId().getValue());
      expect(foundUser?.getName().getValue()).toBe('Id User');
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const user1 = await User.create( 
        Email.create('all1@example.com'),
        PlainPassword.create('SecurePass123!'), 
        Name.create('User One'),
        'USER',
        mockDateProvider 
      );
      const user2 = await User.create( 
        Email.create('all2@example.com'),
        PlainPassword.create('SecurePass123!'), 
        Name.create('User Two'),
        'USER',
        mockDateProvider 
      );
      await repository.save(user1);
      await repository.save(user2);

      const users = await repository.findAll();

      expect(users).toHaveLength(2);
      const names = users.map(u => u.getName().getValue()).sort();
      expect(names).toEqual(['User One', 'User Two']);
    });

    it('should return empty array when no users', async () => {
      const users = await repository.findAll();
      expect(users).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      await prisma.user.deleteMany();
      await prisma.domainEvent.deleteMany();
      await prisma.loginAttempt.deleteMany();

      const user = await User.create( 
        Email.create('update@example.com'),
        PlainPassword.create('SecurePass123!'), 
        Name.create('Old Name'),
        'USER',
        mockDateProvider 
      );

      await repository.save(user);

      const savedUser = await prisma.user.findUnique({
        where: { email: 'update@example.com' },
      });
      expect(savedUser).toBeDefined();

      const newName = Name.create('New Name');
      user.updateName(newName, mockDateProvider); 
      await user.updateRole('EDITOR', 'admin@example.com', mockDateProvider, 'Test update'); 

      await repository.update(user);

      const updatedUser = await prisma.user.findUnique({
        where: { email: 'update@example.com' },
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('New Name');
      expect(updatedUser?.role).toBe('EDITOR');
    });
  });

  describe('delete', () => {
    it('should delete a user from the database', async () => {
      const user = await User.create( 
        Email.create('delete@example.com'),
        PlainPassword.create('SecurePass123!'), 
        Name.create('Delete User'),
        'USER',
        mockDateProvider 
      );
      await repository.save(user);

      await repository.delete(user.getId());

      const deletedUser = await prisma.user.findUnique({
        where: { email: 'delete@example.com' },
      });
      expect(deletedUser).toBeNull();
    });
  });
});