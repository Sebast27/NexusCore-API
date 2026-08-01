import { PrismaClient, Role as PrismaRole } from '@prisma/client';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId'
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { Name } from '../../../domain/value-objects/Name';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        password: user.getPassword().getValue(),
        name: user.getName().getValue(),
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

  async findById(id: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.getValue() },
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
      where: { id: user.getId().getValue() },
      data: {
        email: user.getEmail().getValue(),
        password: await user.getPassword().hash(),
        name: user.getName().getValue(),
        role: user.getRole() as PrismaRole,
        updatedAt: user.getUpdatedAt(),
        deletedAt: user.getDeletedAt(),
      },
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.getValue() },
    });
  }

  private toDomain(prismaUser: any): User {
    const id = UserId.fromString(prismaUser.id);
    const email = Email.create(prismaUser.email);
    const password = Password.createFromHash(prismaUser.password);
    const name = Name.create(prismaUser.name);

    return User.reconstitute(
      id,
      email,
      password,
      name,
      prismaUser.role,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.deletedAt
    );
  }
}