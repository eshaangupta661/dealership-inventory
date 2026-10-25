import { Injectable } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type SafeUser = Omit<User, 'passwordHash'>;

const safeUserSelect = {
  id: true,
  email: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, passwordHash: string): Promise<SafeUser> {
    return this.prisma.user.create({
      data: { email, passwordHash, role: Role.CUSTOMER },
      select: safeUserSelect,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findSafeById(id: number): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  }
}
