import prisma from '../config/db';
import { Prisma, User } from '@prisma/client';

export class UserRepository {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findMany(filters?: any): Promise<User[]> {
    return prisma.user.findMany({ where: filters });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
}
