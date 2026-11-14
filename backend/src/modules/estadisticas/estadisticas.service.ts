import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DateTime } from 'luxon';
import { Publicacion, PublicacionDocument } from '../publicaciones/schemas/publicacion.schema.js';
import { Comentario, ComentarioDocument } from '../comentarios/schema/comentario.schema.js';
import { QueryRangoFechasDto } from './dto/query-rango-fechas.dto.js';
import { QueryEstadisticaPubDto } from './dto/query-estadistica-pub.dto.js';

@Injectable()
export class EstadisticasService {
  private readonly TIMEZONE = 'America/Argentina/Buenos_Aires';

  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
  ) {}

  private validarYObtenerRango(desdeStr?: string, hastaStr?: string) {
    if (!desdeStr || !hastaStr) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Debe indicar las fechas "desde" y "hasta"',
        error: 'Bad Request',
      });
    }

    const dtDesde = DateTime.fromISO(desdeStr, { zone: this.TIMEZONE }).startOf('day');
    const dtHasta = DateTime.fromISO(hastaStr, { zone: this.TIMEZONE }).endOf('day');

    if (!dtDesde.isValid || !dtHasta.isValid) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Formato de fecha inválido. Utiliza YYYY-MM-DD',
        error: 'Bad Request',
      });
    }

    if (dtDesde > dtHasta) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'La fecha "desde" no puede ser posterior a la fecha "hasta"',
        error: 'Bad Request',
      });
    }

    const diffDays = dtHasta.startOf('day').diff(dtDesde.startOf('day'), 'days').days;
    if (diffDays > 366) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'El rango de fechas no puede superar los 366 días',
        error: 'Bad Request',
      });
    }

    return {
      desdeIso: dtDesde.toJSDate(),
      hastaIso: dtHasta.toJSDate(),
      dtDesde,
      dtHasta,
    };
  }

  async publicacionesPorUsuario(dto: QueryRangoFechasDto) {
    const { desdeIso, hastaIso } = this.validarYObtenerRango(dto.desde, dto.hasta);

    const pipeline: any[] = [
      {
        $match: {
          activa: true,
          createdAt: { $gte: desdeIso, $lte: hastaIso },
        },
      },
      {
        $group: {
          _id: '$autor',
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'autorData',
        },
      },
      { $unwind: '$autorData' },
      {
        $project: {
          _id: 0,
          usuarioId: '$_id',
          nombreUsuario: '$autorData.nombreUsuario',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1, nombreUsuario: 1 } },
    ];

    const items = await this.publicacionModel.aggregate(pipeline).exec();
    const total = items.reduce((acc, curr) => acc + curr.cantidad, 0);

    return {
      desde: dto.desde,
      hasta: dto.hasta,
      items,
      total,
    };
  }

  async comentariosPorDia(dto: QueryRangoFechasDto) {
    const { desdeIso, hastaIso, dtDesde, dtHasta } = this.validarYObtenerRango(dto.desde, dto.hasta);

    // 1. Obtener IDs de publicaciones activas para excluir comentarios de publicaciones dadas de baja
    const publicacionesActivas = await this.publicacionModel
      .find({ activa: true })
      .distinct('_id');

    const pipeline: any[] = [
      {
        $match: {
          publicacion: { $in: publicacionesActivas },
          createdAt: { $gte: desdeIso, $lte: hastaIso },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: this.TIMEZONE,
            },
          },
          cantidad: { $sum: 1 },
        },
      },
    ];

    const resultadosDB = await this.comentarioModel.aggregate(pipeline).exec();

    // Crear mapa de resultados de la BD
    const mapaConteo = new Map<string, number>();
    resultadosDB.forEach((r) => mapaConteo.set(r._id, r.cantidad));

    // Rellenar los días vacíos del rango cronológicamente
    const items: Array<{ fecha: string; cantidad: number }> = [];
    let cursor = dtDesde.startOf('day');
    const fin = dtHasta.startOf('day');

    let total = 0;
    while (cursor <= fin) {
      const fechaKey = cursor.toFormat('yyyy-MM-dd');
      const cantidad = mapaConteo.get(fechaKey) || 0;
      items.push({ fecha: fechaKey, cantidad });
      total += cantidad;
      cursor = cursor.plus({ days: 1 });
    }

    return {
      desde: dto.desde,
      hasta: dto.hasta,
      items,
      total,
    };
  }

  async comentariosPorPublicacion(dto: QueryEstadisticaPubDto) {
    const { desdeIso, hastaIso } = this.validarYObtenerRango(dto.desde, dto.hasta);
    const limit = dto.limit || 10;

    const publicacionesActivas = await this.publicacionModel
      .find({ activa: true })
      .distinct('_id');

    const pipeline: any[] = [
      {
        $match: {
          publicacion: { $in: publicacionesActivas },
          createdAt: { $gte: desdeIso, $lte: hastaIso },
        },
      },
      {
        $group: {
          _id: '$publicacion',
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { cantidad: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'publicacions',
          localField: '_id',
          foreignField: '_id',
          as: 'pubData',
        },
      },
      { $unwind: '$pubData' },
      {
        $lookup: {
          from: 'users',
          localField: 'pubData.autor',
          foreignField: '_id',
          as: 'autorData',
        },
      },
      { $unwind: '$autorData' },
      {
        $project: {
          _id: 0,
          publicacionId: '$_id',
          titulo: {
            $cond: {
              if: { $gt: [{ $strLenCP: '$pubData.titulo' }, 40] },
              then: { $concat: [{ $substrCP: ['$pubData.titulo', 0, 37] }, '...'] },
              else: '$pubData.titulo',
            },
          },
          autor: '$autorData.nombreUsuario',
          cantidad: 1,
        },
      },
    ];

    const items = await this.comentarioModel.aggregate(pipeline).exec();
    const total = items.reduce((acc, curr) => acc + curr.cantidad, 0);

    return {
      desde: dto.desde,
      hasta: dto.hasta,
      items,
      total,
    };
  }
}