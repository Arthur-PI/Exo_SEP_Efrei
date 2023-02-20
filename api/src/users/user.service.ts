import { PrismaService } from '@/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { User, Prisma, Credential } from '@prisma/client';
import { hash } from 'bcrypt';

type UserFindData = {
  skip?: number;
  take?: number;
  cursor?: Prisma.UserWhereUniqueInput;
  where?: Prisma.UserWhereInput;
  orderBy?: Prisma.UserOrderByWithRelationInput;
};

interface UserCreate extends Prisma.UserCreateInput {
  password: string;
}

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

  async createUser(data: UserCreate): Promise<Credential> {
    const hashed_password = await hash(data.password, 10);
    return this.prisma.credential.create({
      data: {
        password: hashed_password,
        user: {
          create: {
            username: data.username,
            email: data.email,
          },
        },
      },
    });
  }
}
