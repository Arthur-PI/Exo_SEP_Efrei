import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8000);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutDownHooks(app);
}
bootstrap();
