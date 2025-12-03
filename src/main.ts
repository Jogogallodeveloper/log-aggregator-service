import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // no global prefix, no versioning for now
  await app.listen(3000);
}

bootstrap().catch((err) => {
  // Log startup errors safely
  console.error('Error while starting application:', err);
});
