import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryService } from './common/services/cloudinary/cloudinary.service';
import { UsersModule } from './modules/users/users.module';

import { AuthModule } from './modules/auth/auth.module';
import { PublicacionesModule } from './modules/publicaciones/publicaciones.module';


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
