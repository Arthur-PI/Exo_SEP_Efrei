/* eslint-disable indent */
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Room } from '@prisma/client';
import { Response } from 'express';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  private readonly logger = new Logger(RoomController.name);

  constructor(private readonly roomService: RoomService) {}

  @Get()
  async findAll(@Param() param) {
    try {
      return await this.roomService.rooms({ where: param });
    } catch (err: any) {
      throw new InternalServerErrorException();
    }
  }

  @Get('/available')
  async getAvailable(@Query() params: { start: Date; end: Date }) {
    try {
      const start = new Date(params.start);
      const end = new Date(params.end);
      const rooms = (await this.roomService.availableRooms(start, end)).map(
        (room) => room.id,
      );
      return await this.roomService.rooms({ where: { id: { in: rooms } } });
    } catch (err) {
      this.logger.debug(err);
      throw new InternalServerErrorException();
    }
  }

  @Get('/booked')
  async getBooked(@Query() params: { start: Date; end: Date }) {
    try {
      const start = new Date(params.start);
      const end = new Date(params.end);
      return await this.roomService.bookedRooms(start, end);
    } catch (err) {
      this.logger.debug(err);
      throw new InternalServerErrorException();
    }
  }

  @Get(':number')
  async findOne(@Param('number') number: string) {
    try {
      const room: Room = await this.roomService.room({
        number: parseInt(number),
      });
      if (!room) {
        throw new NotFoundException('this room does not exists');
      }
      return room;
    } catch (err: any) {
      this.logger.debug(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }

  @Post()
  async createOne(
    @Res({ passthrough: true }) res: Response,
    @Body()
    postData: { name: string; number: number; price: number; capacity: number },
  ) {
    try {
      res.status(HttpStatus.CREATED);
      return await this.roomService.createRoom(postData);
    } catch (err: any) {
      if (err.code === 'P2002')
        throw new HttpException('room already exists', HttpStatus.CONFLICT);
      throw new InternalServerErrorException();
    }
  }
}
