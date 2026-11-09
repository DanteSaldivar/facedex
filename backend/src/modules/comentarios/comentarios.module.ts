import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comentario, ComentarioSchema } from './schema/comentario.schema.js';
import { Publicacion, PublicacionSchema } from '../publicaciones/schemas/publicacion.schema.js';
import { ComentariosController } from './comentarios.controller.js';
import { ComentariosService } from './comentarios.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
  exports: [ComentariosService],
})
export class ComentariosModule {}