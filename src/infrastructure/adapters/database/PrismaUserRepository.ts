import { PrismaClient, Role as PrismaRole } from '@prisma/client';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.getId(),
        email: user.getEmail().getValue(),
        password: user.getPassword().getValue(),
        name: user.getName(),
        role: user.getRole() as PrismaRole,
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
        deletedAt: user.getDeletedAt(),
      },
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.getValue() },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
    });

    return users.map((user) => this.toDomain(user));
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.getId() },
      data: {
        email: user.getEmail().getValue(),
        password: await user.getPassword().hash(),
        name: user.getName(),
        role: user.getRole() as PrismaRole,
        updatedAt: user.getUpdatedAt(),
        deletedAt: user.getDeletedAt(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  private toDomain(prismaUser: any): User {
    const email = Email.create(prismaUser.email);
    const password = Password.createFromHash(prismaUser.password);

    return User.reconstitute(
      prismaUser.id,
      email,
      password,
      prismaUser.name,
      prismaUser.role,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.deletedAt
    );
  }
}