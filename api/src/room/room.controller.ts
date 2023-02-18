import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res,
} from '@nestjs/common';
import { Room } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import { Response } from 'express';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async findAll() {
    try {
      return await this.roomService.rooms();
    } catch (err: any) {
      throw new InternalServerErrorException();
    }
  }

  @Get(':number')
  async findOne() {
    try {
      const room: Room = await this.roomService.room({ number: 141 });
      if (!room) {
        throw new HttpException(
          'this room does not exists',
          HttpStatus.NOT_FOUND,
        );
      }
      return room;
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  @Post()
  async createOne(
    @Res({ passthrough: true }) res: Response,
    @Body() postData: { name: string; number: number },
  ) {
    try {
      const { name, number } = postData;
      res.status(HttpStatus.CREATED);
      return await this.roomService.createRoom({
        name,
        number,
      });
    } catch (err: any) {
      if (err.code === 'P2002')
        throw new HttpException('room already exists', HttpStatus.CONFLICT);
      throw new InternalServerErrorException();
    }
  }
}
