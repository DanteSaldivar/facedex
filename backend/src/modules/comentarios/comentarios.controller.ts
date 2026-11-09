import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';
import { ComentariosService } from './comentarios.service';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { QueryComentariosDto } from './dto/query-comentarios.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objet-id/parse-objet-id.pipe';
import { UsuarioActual } from 'src/common/decoradores/usuario-actual.decorator';

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