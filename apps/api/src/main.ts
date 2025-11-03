import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  
  dotenv.config();
  
  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000/api`);
}

bootstrap();
