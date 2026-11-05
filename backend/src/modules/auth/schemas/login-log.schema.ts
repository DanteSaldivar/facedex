import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoginLogDocument = LoginLog & Document;

@Schema({ timestamps: true })
export class LoginLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  fecha?: Date;
}

export const LoginLogSchema = SchemaFactory.createForClass(LoginLog);