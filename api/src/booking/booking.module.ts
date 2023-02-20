import { PrismaService } from '@/prisma.service';
import { RoomService } from '@/room/room.service';
import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [],
  controllers: [BookingController],
  providers: [BookingService, PrismaService, RoomService],
})
export class BookingModule {}
