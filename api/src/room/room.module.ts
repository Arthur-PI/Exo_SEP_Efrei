import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
  imports: [],
  controllers: [RoomController],
  providers: [RoomService, PrismaService],
})
export class RoomModule {}
