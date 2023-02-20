/* eslint-disable indent */
import { RoomService } from '@/room/room.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(
    private readonly bookingService: BookingService,
    private readonly roomservice: RoomService,
  ) {}

  @Get()
  async findAll(@Param() param) {
    try {
      return await this.bookingService.bookings({ where: param });
    } catch (err: any) {
      throw new InternalServerErrorException();
    }
  }

  @Post()
  async createOne(
    @Res({ passthrough: true }) res: Response,
    @Body()
    postData: {
      id_room: number;
      id_user: number;
      date_start: Date;
      date_end: Date;
    },
  ) {
    try {
      const { id_room, id_user } = postData;
      const date_start = new Date(postData.date_start);
      const date_end = new Date(postData.date_end);
      let rooms = await this.roomservice.availableRooms(date_start, date_end);
      rooms = rooms.filter((room) => room.id === id_room);
      if (rooms.length === 0) {
        throw new HttpException(
          "the room for this date isn't available",
          HttpStatus.BAD_REQUEST,
        );
      }
      res.status(HttpStatus.CREATED);
      return await this.bookingService.createBooking({
        id_room,
        id_user,
        date_end,
        date_start,
      });
    } catch (err: any) {
      this.logger.debug(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }

  @Put(':id')
  async changeBooking(
    @Param('id') string_id: string,
    @Body()
    updateData: {
      date_start?: Date;
      date_end?: Date;
      room_id?: number;
      user_id?: number;
    },
  ) {
    try {
      const id = parseInt(string_id);
      if (updateData.date_start)
        updateData.date_start = new Date(updateData.date_start);
      if (updateData.date_end)
        updateData.date_end = new Date(updateData.date_end);
      const data: {
        date_start?: Date;
        date_end?: Date;
        room_id?: number;
        user_id?: number;
      } = updateData;
      return this.bookingService.updateBooking(id, data);
    } catch (err) {
      this.logger.debug(err);
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  async deleteBooking(@Param('id') string_id: string) {
    try {
      const id = parseInt(string_id);
      return this.bookingService.deleteBooking(id);
    } catch (err: any) {
      this.logger.debug(err);
      throw new InternalServerErrorException();
    }
  }
}
