import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module.js';
import { PublicacionesModule } from './modules/publicaciones/publicaciones.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CloudinaryService } from './common/services/cloudinary/cloudinary.service.js';


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
    AuthModule,],
  controllers: [AppController],
  providers: [AppService, CloudinaryService],
})
export class AppModule {}
