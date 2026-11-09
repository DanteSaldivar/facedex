import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';
import { ComentariosService } from './comentarios.service.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { QueryComentariosDto } from './dto/query-comentarios.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objet-id/parse-objet-id.pipe.js';
import { UsuarioActual } from '../../common/decoradores/usuario-actual.decorator.js';

@Controller('publicaciones')
@UseGuards(JwtAuthGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) { }

  @Post(':id/comentarios')
  @HttpCode(HttpStatus.CREATED)
  async crear(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: CrearComentarioDto,
    @UsuarioActual('id') usuarioId: string,
  ) {
    return this.comentariosService.crear(id, dto, usuarioId);
  }

  @Put(':id/comentarios/:comentarioId')
  async editar(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Param('comentarioId', ParseObjectIdPipe) comentarioId: Types.ObjectId,
    @Body() dto: CrearComentarioDto,
    @UsuarioActual('id') usuarioId: string,
  ) {
    return this.comentariosService.editar(id, comentarioId, dto, usuarioId);
  }

  @Get(':id/comentarios')
  async listar(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query() queryDto: QueryComentariosDto,
  ) {
    return this.comentariosService.listar(id, queryDto);
  }
}