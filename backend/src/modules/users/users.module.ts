import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema.js';
import { UsersService } from './services/users.service.js';
import { UsersController } from './users.controller.js';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, CloudinaryService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}