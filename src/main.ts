import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // no global prefix, no versioning for now
  await app.listen(3000);
}
bootstrap();
