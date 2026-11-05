import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');

  // ValidationPipe global con formateo de errores en array
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => {
          return Object.values(err.constraints || {}).join(', ');
        });
        return new BadRequestException({
          statusCode: 400,
          message: messages,
          error: 'Bad Request',
        });
      },
    }),
  );

  // CORS habilitado para localhost y URL de prod
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Servidor corriendo en el puerto ${port}`);


}
bootstrap();
