import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Room } from '@prisma/client';

type RoomFindData = {
  skip?: number;
  take?: number;
  cursor?: Prisma.RoomWhereUniqueInput;
  where?: Prisma.RoomWhereInput;
  orderBy?: Prisma.RoomOrderByWithRelationInput;
};

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async room(roomUniqueId: Prisma.RoomWhereUniqueInput): Promise<Room | null> {
    return this.prisma.room.findUnique({
      where: roomUniqueId,
    });
  }

  async rooms(params?: RoomFindData): Promise<Room[]> {
    return this.prisma.room.findMany(params);
  }

  async createRoom(data?: Prisma.RoomCreateInput): Promise<Room> {
    return this.prisma.room.create({
      data,
    });
  }
}
