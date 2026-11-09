import { Injectable, NotFoundException, ForbiddenException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './schema/comentario.schema.js';
import { Publicacion, PublicacionDocument } from '../publicaciones/schemas/publicacion.schema.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { QueryComentariosDto } from './dto/query-comentarios.dto.js';

@Injectable()
export class ComentariosService {
    constructor(
        @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
        @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
    ) { }

    async crear(publicacionId: Types.ObjectId, dto: CrearComentarioDto, usuarioId: string) {
        const pub = await this.publicacionModel.findOne({ _id: publicacionId, activa: true });
        if (!pub) {
            throw new NotFoundException({
                statusCode: 404,
                message: 'Publicación no encontrada o inactiva',
                error: 'Not Found',
            });
        }

        const nuevoComentario = new this.comentarioModel({
            publicacion: publicacionId,
            autor: new Types.ObjectId(usuarioId),
            mensaje: dto.mensaje,
            modificado: false,
        });

        const guardado = await nuevoComentario.save();
        const comentarioCompleto = await guardado.populate('autor', 'nombreUsuario imagenPerfil');
        const autor = (comentarioCompleto.autor as any) ?? {};

        return {
            _id: comentarioCompleto._id,
            mensaje: comentarioCompleto.mensaje,
            modificado: comentarioCompleto.modificado,
            autor: {
                _id: autor._id,
                nombreUsuario: autor.nombreUsuario ?? 'Usuario FaceDex',
                imagenPerfil: autor.imagenPerfil || '',
            },
            createdAt: (comentarioCompleto as any).createdAt,
        };
    }

    async editar(
        publicacionId: Types.ObjectId,
        comentarioId: Types.ObjectId,
        dto: CrearComentarioDto,
        usuarioId: string,
    ) {
        const pub = await this.publicacionModel.findOne({ _id: publicacionId, activa: true });
        if (!pub) {
            throw new NotFoundException({
                statusCode: 404,
                message: 'Publicación no encontrada o inactiva',
                error: 'Not Found',
            });
        }

        const comentario = await this.comentarioModel.findOne({
            _id: comentarioId,
            publicacion: publicacionId,
        });

        if (!comentario) {
            throw new NotFoundException({
                statusCode: 404,
                message: 'El comentario no existe o no pertenece a esta publicación',
                error: 'Not Found',
            });
        }

        if (comentario.autor?.toString() !== usuarioId) {
            throw new ForbiddenException({
                statusCode: 403,
                message: 'No tienes permisos para editar este comentario',
                error: 'Forbidden',
            });
        }

        comentario.mensaje = dto.mensaje;
        comentario.modificado = true;
        await comentario.save();

        const comentarioCompleto = await comentario.populate('autor', 'nombreUsuario imagenPerfil');

        return {
            _id: comentarioCompleto?._id,
            mensaje: comentarioCompleto?.mensaje,
            modificado: comentarioCompleto?.modificado,
            autor: {
                _id: comentarioCompleto?.autor?._id,
                nombreUsuario: (comentarioCompleto?.autor as any).nombreUsuario,
                imagenPerfil: (comentarioCompleto?.autor as any).imagenPerfil || '',
            },
            createdAt: (comentarioCompleto as any).createdAt,
        };
    }

    async listar(publicacionId: Types.ObjectId, queryDto: QueryComentariosDto) {
        const { offset = 0, limit = 10 } = queryDto;

        const pub = await this.publicacionModel.findOne({ _id: publicacionId, activa: true });
        if (!pub) {
            throw new NotFoundException({
                statusCode: 404,
                message: 'Publicación no encontrada',
                error: 'Not Found',
            });
        }

        const filtro = { publicacion: publicacionId };
        const total = await this.comentarioModel.countDocuments(filtro);

        // Paginación estable: Orden desc por createdAt y desempate por _id desc
        const comentarios = await this.comentarioModel
            .find(filtro)
            .sort({ createdAt: -1, _id: -1 })
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
                nombreUsuario: (c.autor as any)?.nombreUsuario || 'Usuario FaceDex',
                imagenPerfil: (c.autor as any)?.imagenPerfil || '',
            },
            createdAt: (c as any).createdAt,
        }));

        return { items, total, offset, limit };
    }
}