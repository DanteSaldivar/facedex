import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  nombre?: string;

  @Prop({ required: true, trim: true })
  apellido?: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo?: string;

  @Prop({ required: true, unique: true, trim: true })
  nombreUsuario?: string;

  @Prop({ required: true, select: false })
  password?: string;

  @Prop({ required: true })
  fechaNacimiento?: Date;

  @Prop({ required: true, maxlength: 200 })
  descripcion?: string;

  @Prop({ default: '' })
  imagenPerfil?: string;

  @Prop({ type: String, enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil?: string;

  @Prop({ type: Boolean, default: true })
  habilitado?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};