import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';
import { QueryRangoFechasDto } from './dto/query-rango-fechas.dto.js';
import { QueryEstadisticaPubDto } from './dto/query-estadistica-pub.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decoradores/roles.decotor.js';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador') // Exclusivo para administradores
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  async publicacionesPorUsuario(@Query() dto: QueryRangoFechasDto) {
    return this.estadisticasService.publicacionesPorUsuario(dto);
  }

  @Get('comentarios-por-dia')
  async comentariosPorDia(@Query() dto: QueryRangoFechasDto) {
    return this.estadisticasService.comentariosPorDia(dto);
  }

  @Get('comentarios-por-publicacion')
  async comentariosPorPublicacion(@Query() dto: QueryEstadisticaPubDto) {
    return this.estadisticasService.comentariosPorPublicacion(dto);
  }
}