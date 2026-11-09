import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comentario, ComentarioSchema } from './schema/comentario.schema';
import { Publicacion, PublicacionSchema } from '../publicaciones/schemas/publicacion.schema';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';

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