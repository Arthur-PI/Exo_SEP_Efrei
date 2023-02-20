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
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param() param) {
    try {
      const room: User = await this.userService.user({
        id: parseInt(param.id),
      });
      if (!room) {
        throw new NotFoundException('this user does not exists');
      }
      return room;
    } catch (err: any) {
      this.logger.debug(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  @Post('register')
  async createUser(
    @Body() postData: { username: string; email: string; password: string },
  ) {
    try {
      const creds = await this.userService.createUser(postData);
      return await this.findOne({ id: creds.id });
    } catch (err) {
      if (err.code === 'P2002')
        throw new HttpException('user already exists', HttpStatus.CONFLICT);
      throw new InternalServerErrorException();
    }
  }
}
