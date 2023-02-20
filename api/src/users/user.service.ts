import { PrismaService } from '@/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { User, Prisma, Credential } from '@prisma/client';

type UserFindData = {
  skip?: number;
  take?: number;
  cursor?: Prisma.UserWhereUniqueInput;
  where?: Prisma.UserWhereInput;
  orderBy?: Prisma.UserOrderByWithRelationInput;
};

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async user(userUniqueId: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userUniqueId,
    });
  }

  async users(params: UserFindData): Promise<User[]> {
    return this.prisma.user.findMany(params);
  }

  async createUser(
    data: Prisma.UserCreateInput,
    password: string,
  ): Promise<Credential> {
    return this.prisma.credential.create({
      data: {
        password,
        user: {
          create: data,
        },
      },
    });
  }

  async getCredentials(
    data: Prisma.CredentialWhereUniqueInput,
  ): Promise<Credential> {
    return this.prisma.credential.findUnique({ where: data });
  }
}
