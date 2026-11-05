import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema.js';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema.js';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './services/publicaciones.service.js';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService, CloudinaryService],
  exports: [PublicacionesService],
})
export class PublicacionesModule {}