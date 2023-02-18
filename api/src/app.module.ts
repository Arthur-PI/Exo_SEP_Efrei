import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RoomController } from './room/room.controller';
import { RoomService } from './room/room.service';
import { UserController } from './users/user.controller';
import { UserService } from './users/user.service';

@Module({
  imports: [],
  controllers: [RoomController, UserController],
  providers: [RoomService, UserService, PrismaService],
})
export class AppModule {}
