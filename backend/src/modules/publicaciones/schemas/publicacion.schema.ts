import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicacionDocument = Publicacion & Document;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true })
  titulo?: string;

  @Prop({ required: true })
  mensaje?: string;

  @Prop({ default: '' })
  imagenUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor?: Types.ObjectId;

  @Prop([
    {
      usuario: { type: Types.ObjectId, ref: 'User' },
      fecha: { type: Date, default: Date.now },
    },
  ])
  likes?: Array<{ usuario: Types.ObjectId; fecha: Date }>;

  @Prop({ type: Boolean, default: true })
  activa?: boolean;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  guardadoPor?: Types.ObjectId[];

  @Prop([
    {
      usuario: { type: Types.ObjectId, ref: 'User' },
      fecha: { type: Date, default: Date.now },
    },
  ])
  compartidos?: Array<{ usuario: Types.ObjectId; fecha: Date }>;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);

// Índices definidos explícitamente
PublicacionSchema.index({ createdAt: -1 });
PublicacionSchema.index({ autor: 1 });
PublicacionSchema.index({ activa: 1, createdAt: -1 });
PublicacionSchema.index({ 'likes.usuario': 1 });