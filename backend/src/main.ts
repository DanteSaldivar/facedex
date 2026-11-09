import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');

  app.use(cookieParser());

  // Validación de consistencia para cookies
  const cookieSecure = configService.get<string>('COOKIE_SECURE') === 'true';
  const cookieSameSite = (configService.get<string>('COOKIE_SAMESITE') || 'lax').toLowerCase();

  if (cookieSameSite === 'none' && !cookieSecure) {
    console.error('Si COOKIE_SAMESITE es "none", COOKIE_SECURE debe ser "true".');
    process.exit(1);
  }

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

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Servidor corriendo en el puerto ${port}`);


}
bootstrap();
 