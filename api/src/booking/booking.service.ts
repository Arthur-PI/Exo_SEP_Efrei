import { PrismaService } from '@/prisma.service';
import { RoomService } from '@/room/room.service';
import { Injectable, Logger } from '@nestjs/common';
import { Booking, Prisma } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';

type BookingFindData = {
  skip?: number;
  take?: number;
  cursor?: Prisma.BookingWhereUniqueInput;
  where?: Prisma.BookingWhereInput;
  orderBy?: Prisma.BookingOrderByWithRelationInput;
};

interface BookingCreate {
  id?: number;
  id_room: number;
  id_user: number;
  date_start: Date;
  date_end: Date;
}

function compute_days(start: Date, end: Date): number {
  const days: number = Math.floor(
    (end.getTime() - start.getTime()) / (1000 * 3600 * 24),
  );
  return days;
}

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private prisma: PrismaService,
    private roomService: RoomService,
  ) {}

  async booking(
    bookingUniqueId: Prisma.BookingWhereUniqueInput,
  ): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: bookingUniqueId,
    });
  }

  async bookings(params?: BookingFindData): Promise<Booking[]> {
    return this.prisma.booking.findMany(params);
  }

  async createBooking(data?: BookingCreate): Promise<Booking> {
    const days = compute_days(data.date_start, data.date_end);
    if (days < 1) {
      throw new Prisma.PrismaClientValidationError('Invalid dates');
    }
    return this.prisma.booking.create({
      data: {
        date_start: data.date_start,
        date_end: data.date_end,
        days,
        room: {
          connect: {
            id: data.id_room,
          },
        },
        user: {
          connect: {
            id: data.id_user,
          },
        },
      },
    });
  }

  async updateBooking(
    id: number,
    data?: {
      date_start?: Date;
      date_end?: Date;
      room_id?: number;
      user_id?: number;
    },
  ): Promise<Booking> {
    let booking: Booking = await this.booking({ id });
    if (!booking)
      throw new PrismaClientValidationError('This booking does not exists');
    booking = {
      ...booking,
      ...data,
    };
    const days = compute_days(booking.date_start, booking.date_end);
    if (days < 1) {
      throw new Prisma.PrismaClientValidationError('Invalid dates');
    }
    const bookings: Booking[] = await this.prisma.$queryRaw(Prisma.sql`
      SELECT * FROM "Booking"
        WHERE ((date_end > ${booking.date_start} AND date_end <= ${booking.date_end})
           OR (date_start >= ${booking.date_start} AND date_start < ${booking.date_end})
           OR (date_start < ${booking.date_start} AND date_end > ${booking.date_end}))
          AND id != ${id} AND room_id = ${booking.room_id};
    `);
    if (bookings.length !== 0) {
      return Promise.reject(
        new PrismaClientValidationError('Invalid dates, room not available'),
      );
    }
    return this.prisma.booking.update({
      data: { ...booking, days },
      where: { id },
    });
  }

  async deleteBooking(id: number) {
    return this.prisma.booking.delete({ where: { id } });
  }
}
