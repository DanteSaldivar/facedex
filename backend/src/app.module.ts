import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryService } from './common/services/cloudinary/cloudinary.service.js';
import { UsersModule } from './modules/users/users.module.js';

import { AuthModule } from './modules/auth/auth.module.js';
import { PublicacionesModule } from './modules/publicaciones/publicaciones.module.js';
import { ComentariosModule } from './modules/comentarios/comentarios.module.js';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    UsersModule,
    PublicacionesModule,
    AuthModule,
    ComentariosModule,],
  controllers: [AppController],
  providers: [AppService, CloudinaryService],
})
export class AppModule {}
