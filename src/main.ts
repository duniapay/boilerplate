import { NestFactory } from '@nestjs/core';
import { setupSwagger } from './swagger';
import { useContainer } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  setupSwagger(app);
  // Enable Cors for development
  app.enableCors();
  // Global Pipe to intercept request and format data accordingly
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  // Listen to port given by environment on production server (Heroku, DigitalOcean App,..), otherwise 3000
  // Specify '0.0.0.0' in the listen() to accept connections on other hosts.
  await app.listen(process.env.PORT || 3000);
  app.flushLogs();
}
bootstrap();
