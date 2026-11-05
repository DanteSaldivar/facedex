import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByCorreo(correo: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ correo: correo.toLowerCase() }).select('+password').exec();
  }

  async findByNombreUsuario(nombreUsuario: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ nombreUsuario }).select('+password').exec();
  }

  async findByIdentificador(identificador: string): Promise<UserDocument | null> {
    const ident = identificador.toLowerCase();
    return this.userModel
      .findOne({
        $or: [{ correo: ident }, { nombreUsuario: identificador }],
      })
      .select('+password')
      .exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }
}