import {
  BadRequestException,
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
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { UserService } from './user.service';

const TOKEN_SECRET =
  'f84c1201d0b9b64cbd49d70c4c80955b53ebc4b4b4d6939b2cfd8cc4847cb391ff1269fc7e33c84ba2e5a02f8e0aee1d907927ab4140a56bdf33736f985f493ce05f76560a8728f26c9eeed5ba5bf73b5b60279eb535ff10cc25c4543c1da3386f19c47ab5839eecdb5bdc49e9be228e09671ae43fdc41c5225cdd5320adb53c887518482378242df74bd1bee32070256f157235bf70afa0b792d514edce70eaa0280f9cdecdcc3a4b7ace1d75a3e37ad33b3deb958310188b4af7baab0a1467f9f92967de0eff53e3d9407ae4572107db2db3662ea5f75bcf78422f6149597dd148c066811ce28b9b872c7285d92d633dbf6f2cc2c7c9d44a7fdc2930e5daeb';

function createToken(user: User): string {
  return sign({ data: user }, TOKEN_SECRET, { expiresIn: '1h' });
}

function verifyToken(token: string) {
  verify(token, TOKEN_SECRET);
}

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
      const { username, email, password } = postData;
      const hashed_password = await hash(password, 10);
      await this.userService.createUser(
        {
          username,
          email,
        },
        hashed_password,
      );
      return this.verifyUser({ email, password });
    } catch (err) {
      if (err.code === 'P2002')
        throw new HttpException('user already exists', HttpStatus.CONFLICT);
      throw new InternalServerErrorException();
    }
  }

  @Post('login')
  async verifyUser(@Body() postData: { email: string; password: string }) {
    try {
      const { email, password } = postData;
      const user = await this.userService.user({ email });
      if (!user) throw new NotFoundException('no user with this email');
      const creds = await this.userService.getCredentials({ id: user.id });
      if (!creds) throw new InternalServerErrorException();
      if (!(await compare(password, creds.password)))
        throw new BadRequestException('Invalid credential');
      const token = createToken(user);
      return { ...user, token };
    } catch (err: any) {
      this.logger.debug(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }
}
