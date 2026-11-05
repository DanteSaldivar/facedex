import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from '../schemas/publicacion.schema';
import { Comentario, ComentarioDocument, } from '../schemas/comentario.schema';
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service';
import { CrearPublicacionDto } from '../dto/crear-publicaciones.dto';
import { QueryPublicacionesDto } from '../dto/query-publicaciones.dto';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async crear(
    dto: CrearPublicacionDto,
    usuarioId: string,
    file?: Express.Multer.File,
  ) {
    let imagenUrl: string | null = null;
    if (file) {
      const resultado = await this.cloudinaryService.subirImagen(file, 'publicaciones');
      imagenUrl = resultado.url!;
    }

    const nuevaPublicacion = new this.publicacionModel({
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      imagenUrl,
      autor: new Types.ObjectId(usuarioId),
      activa: true,
      likes: [],
      guardadoPor: [],
      compartidos: [],
    });

    const guardada = await nuevaPublicacion.save();
    const publicacionCompleta = await guardada.populate('autor', 'nombreUsuario imagenPerfil');

    return {
      _id: publicacionCompleta._id,
      titulo: publicacionCompleta.titulo,
      mensaje: publicacionCompleta.mensaje,
      imagenUrl: publicacionCompleta.imagenUrl || null,
      autor: {
        _id: publicacionCompleta.autor!._id,
        nombreUsuario: (publicacionCompleta.autor as any).nombreUsuario,
        imagenPerfil: (publicacionCompleta.autor as any).imagenPerfil || '',
      },
      likesCount: 0,
      meGusta: false,
      comentariosCount: 0,
      createdAt: (publicacionCompleta as any).createdAt,
    };
  }

  async listar(queryDto: QueryPublicacionesDto, usuarioTokenId: string) {
    const { orden, offset, limit, usuarioId } = queryDto;
    const currentUserId = new Types.ObjectId(usuarioTokenId);

    // 1. Construir match inicial
    const matchStage: any = { activa: true };
    if (usuarioId) {
      matchStage.autor = new Types.ObjectId(usuarioId);
    }

    // 2. Definir sort stage
    const sortStage: any = {};
    if (orden === 'likes') {
      sortStage.likesCount = -1;
      sortStage.createdAt = -1; // Desempate por fecha
    } else {
      sortStage.createdAt = -1;
    }

    // Pipeline de Agregación
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          meGusta: {
            $in: [currentUserId, '$likes.usuario'],
          },
        },
      },
      { $sort: sortStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: offset },
            { $limit: limit },
            // Lookup Autor
            {
              $lookup: {
                from: 'users',
                localField: 'autor',
                foreignField: '_id',
                as: 'autorData',
              },
            },
            { $unwind: '$autorData' },
            // Lookup Comentarios (para conteo)
            {
              $lookup: {
                from: 'comentarios',
                localField: '_id',
                foreignField: 'publicacion',
                as: 'comentariosData',
              },
            },
            {
              $project: {
                _id: 1,
                titulo: 1,
                mensaje: 1,
                imagenUrl: { $ifNull: ['$imagenUrl', null] },
                autor: {
                  _id: '$autorData._id',
                  nombreUsuario: '$autorData.nombreUsuario',
                  imagenPerfil: { $ifNull: ['$autorData.imagenPerfil', ''] },
                },
                likesCount: 1,
                meGusta: 1,
                comentariosCount: { $size: '$comentariosData' },
                createdAt: 1,
              },
            },
          ],
        },
      },
    ];

    const result = await this.publicacionModel.aggregate(pipeline).exec();
    const metadata = result[0].metadata;
    const total = metadata.length > 0 ? metadata[0].total : 0;
    const items = result[0].data;

    return {
      items,
      total,
      offset,
      limit,
    };
  }

  async darBajaLogica(publicacionId: Types.ObjectId, usuario: { id: string; perfil: string }) {
    const publicacion = await this.publicacionModel.findOne({
      _id: publicacionId,
      activa: true,
    });

    if (!publicacion) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'La publicación no existe o ya fue dada de baja',
        error: 'Not Found',
      });
    }

    const esAutor = publicacion.autor!.toString() === usuario.id;
    const esAdmin = usuario.perfil === 'administrador';

    if (!esAutor && !esAdmin) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'No tienes permisos para eliminar esta publicación',
        error: 'Forbidden',
      });
    }

    publicacion.activa = false;
    await publicacion.save();

    return { message: 'Publicación eliminada correctamente' };
  }

  async darLike(publicacionId: Types.ObjectId, usuarioId: string) {
    const userIdObj = new Types.ObjectId(usuarioId);

    // Verificar si la publicación existe y está activa
    const existe = await this.publicacionModel.findOne({ _id: publicacionId, activa: true });
    if (!existe) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'La publicación no existe o está inactiva',
        error: 'Not Found',
      });
    }

    // Actualización Atómica: Agrega el like SOLO si no está presente en el array
    const result = await this.publicacionModel.findOneAndUpdate(
      {
        _id: publicacionId,
        activa: true,
        'likes.usuario': { $ne: userIdObj },
      },
      {
        $push: { likes: { usuario: userIdObj, fecha: new Date() } },
      },
      { returnDocument: 'after' },
    );

    if (!result) {
      // Si no devolvió documento, es porque el usuario ya le había dado me gusta
      throw new ConflictException({
        statusCode: 409,
        message: 'Ya le diste Me gusta a esta publicación',
        error: 'Conflict',
      });
    }

    return {
      likesCount: result.likes!.length,
      meGusta: true,
    };
  }

  async quitarLike(publicacionId: Types.ObjectId, usuarioId: string) {
    const userIdObj = new Types.ObjectId(usuarioId);

    // Verificar existencia previa de la publicación activa
    const existe = await this.publicacionModel.findOne({ _id: publicacionId, activa: true });
    if (!existe) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'La publicación no existe o está inactiva',
        error: 'Not Found',
      });
    }

    /**
     * Decisión de Código HTTP: Elegimos 404 en lugar de 400.
     * Razón: El recurso "Like asignado a esta combinación de (publicación, usuario)" NO fue encontrado en la BD.
     */
    const result = await this.publicacionModel.findOneAndUpdate(
      {
        _id: publicacionId,
        activa: true,
        'likes.usuario': userIdObj,
      },
      {
        $pull: { likes: { usuario: userIdObj } },
      },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'No habías dado Me gusta a esta publicación',
        error: 'Not Found',
      });
    }

    return {
      likesCount: result.likes!.length,
      meGusta: false,
    };
  }

  async obtenerComentariosEsqueleto(
    publicacionId: Types.ObjectId,
    offset: number = 0,
    limit: number = 10,
  ) {
    const filtro = { publicacion: publicacionId };

    const total = await this.comentarioModel.countDocuments(filtro);
    const comentarios = await this.comentarioModel
      .find(filtro)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('autor', 'nombreUsuario imagenPerfil')
      .exec();

    const items = comentarios.map((c) => ({
      _id: c._id,
      mensaje: c.mensaje,
      modificado: c.modificado || false,
      autor: {
        _id: (c.autor as any)?._id,
        nombreUsuario: (c.autor as any)?.nombreUsuario || 'Usuario Desconocido',
        imagenPerfil: (c.autor as any)?.imagenPerfil || '',
      },
      createdAt: (c as any).createdAt,
    }));

    return { items, total };
  }
}