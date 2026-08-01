import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaUserRepository } from '../../src/infrastructure/adapters/database/PrismaUserRepository';
import { User } from '../../src/domain/entities/User';
import { Email } from '../../src/domain/value-objects/Email';
import { Password } from '../../src/domain/value-objects/Password';
import { Name } from '../../src/domain/value-objects/Name'

describe('PrismaUserRepository Integration Tests', () => {
  // Crear el adapter con la URL de la base de datos
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  
  const prisma = new PrismaClient({ adapter });
  const repository = new PrismaUserRepository(prisma);

  beforeEach(async () => {
    // Limpiar la tabla antes de cada prueba
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('save', () => {
    it('should save a user to the database', async () => {
      // Arrange
      const user = User.create(
        Email.create('test@example.com'),
        Password.create('SecurePass123!'),
        Name.create('Test User'),
        'USER'
      );

      // Act
      await repository.save(user);

      // Assert
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
      // Arrange
      const user = User.create(
        Email.create('find@example.com'),
        Password.create('SecurePass123!'),
        Name.create('Find User'),
        'USER'
      );
      await repository.save(user);

      // Act
      const foundUser = await repository.findByEmail(Email.create('find@example.com'));

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.getEmail().getValue()).toBe('find@example.com');
      expect(foundUser?.getName().getValue()).toBe('Find User');
    });

    it('should return null when user not found', async () => {
      // Act
      const foundUser = await repository.findByEmail(Email.create('notfound@example.com'));

      // Assert
      expect(foundUser).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      // Arrange
      const user = User.create(
        Email.create('id@example.com'),
        Password.create('SecurePass123!'),
        Name.create('Id User'),
        'USER'
      );
      await repository.save(user);

      // Act
      const foundUser = await repository.findById(user.getId());

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.getId().getValue()).toBe(user.getId().getValue());
      expect(foundUser?.getName().getValue()).toBe('Id User');
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      // Arrange
      const user1 = User.create(
        Email.create('all1@example.com'),
        Password.create('SecurePass123!'),
        Name.create('User One'),
        'USER'
      );
      const user2 = User.create(
        Email.create('all2@example.com'),
        Password.create('SecurePass123!'),
        Name.create('User Two'),
        'USER'
      );
      await repository.save(user1);
      await repository.save(user2);

      // Act
      const users = await repository.findAll();

      // Assert
      expect(users).toHaveLength(2);
      expect(users[0].getName().getValue()).toBe('User One');
      expect(users[1].getName().getValue()).toBe('User Two');
    });

    it('should return empty array when no users', async () => {
      // Act
      const users = await repository.findAll();

      // Assert
      expect(users).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      // Arrange
      const user = User.create(
        Email.create('update@example.com'),
        Password.create('SecurePass123!'),
        Name.create('Old Name'),
        'USER'
      );
      await repository.save(user);

      // Modificar el usuario
      const newName = Name.create('New Name');
      user.updateName(newName);
      user.updateRole('EDITOR');

      // Act
      await repository.update(user);

      // Assert
      const updatedUser = await prisma.user.findUnique({
        where: { email: 'update@example.com' },
      });

      expect(updatedUser?.name).toBe('New Name');
      expect(updatedUser?.role).toBe('EDITOR');
    });
  });

  describe('delete', () => {
    it('should delete a user from the database', async () => {
      // Arrange
      const user = User.create(
        Email.create('delete@example.com'),
        Password.create('SecurePass123!'),
        Name.create('Delete User'),
        'USER'
      );
      await repository.save(user);

      // Act
      await repository.delete(user.getId());

      // Assert
      const deletedUser = await prisma.user.findUnique({
        where: { email: 'delete@example.com' },
      });
      expect(deletedUser).toBeNull();
    });
  });
});