/* eslint-disable prettier/prettier */
import { PrismaService } from '@/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Room } from '@prisma/client';

export type RoomFindData = {
  skip?: number;
  take?: number;
  cursor?: Prisma.RoomWhereUniqueInput;
  where?: Prisma.RoomWhereInput;
  orderBy?: Prisma.RoomOrderByWithRelationInput;
};

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

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

  async availableRooms(start: Date, end: Date): Promise<Room[]> {
    if (start >= end) {
      throw new Prisma.PrismaClientValidationError('Invalid dates');
    }
    return this.prisma.$queryRaw(Prisma.sql`
      SELECT id FROM "Room"
        EXCEPT (
          SELECT room_id FROM "Booking"
                        WHERE (date_end > ${start} AND date_end <= ${end})
                           OR (date_start >= ${start} AND date_start < ${end})
                           OR (date_start < ${start} AND date_end > ${end})
        );
    `);
  }

  async bookedRooms(start: Date, end: Date): Promise<Room[]> {
    if (start >= end) {
      throw new Prisma.PrismaClientValidationError('Invalid dates');
    }
    return this.prisma.$queryRaw(Prisma.sql`
    SELECT * FROM "Room"
      WHERE id IN (
        SELECT room_id FROM "Booking"
                      WHERE (date_end > ${start} AND date_end <= ${end})
                         OR (date_start >= ${start} AND date_start < ${end})
                         OR (date_start < ${start} AND date_end > ${end})
      );
    `);
  }
}
