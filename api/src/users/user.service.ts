import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';

type UserFindData = {
  skip?: number;
  take?: number;
  cursor?: Prisma.UserWhereUniqueInput;
  where?: Prisma.UserWhereInput;
  orderBy?: Prisma.UserOrderByWithRelationInput;
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(userUniqueId: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userUniqueId,
    });
  }

  async users(params: UserFindData): Promise<User[]> {
    return this.prisma.user.findMany(params);
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }
}
