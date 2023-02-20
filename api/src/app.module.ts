import { Module } from '@nestjs/common';
import { BookingModule } from './booking/booking.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [UserModule, RoomModule, BookingModule],
})
export class AppModule {}
