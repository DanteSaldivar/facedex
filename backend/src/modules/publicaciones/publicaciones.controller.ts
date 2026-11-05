import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, HttpCode, HttpStatus, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard.js';
import { PublicacionesService } from './services/publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicaciones.dto.js';
import { UsuarioActual } from 'src/common/decoradores/usuario-actual.decorator.js';
import { QueryPublicacionesDto } from './dto/query-publicaciones.dto.js';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objet-id/parse-objet-id.pipe.js';




@Controller('publicaciones')
@UseGuards(JwtAuthGuard) // Todas las rutas protegidas por regla del prompt
export class PublicacionesController {
    constructor(private readonly publicacionesService: PublicacionesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('imagen'))
    async crear(
        @Body() dto: CrearPublicacionDto,
        @UsuarioActual('id') usuarioId: string,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.publicacionesService.crear(dto, usuarioId, file);
    }

    @Get()
    async listar(
        @Query() queryDto: QueryPublicacionesDto,
        @UsuarioActual('id') usuarioId: string,
    ) {
        return this.publicacionesService.listar(queryDto, usuarioId);
    }

    @Delete(':id')
    async darBajaLogica(
        @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
        @UsuarioActual() usuario: { id: string; perfil: string },
    ) {
        return this.publicacionesService.darBajaLogica(id, usuario);
    }

    @Post(':id/like')
    @HttpCode(HttpStatus.CREATED)
    async darLike(
        @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
        @UsuarioActual('id') usuarioId: string,
    ) {
        return this.publicacionesService.darLike(id, usuarioId);
    }

    @Delete(':id/like')
    async quitarLike(
        @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
        @UsuarioActual('id') usuarioId: string,
    ) {
        return this.publicacionesService.quitarLike(id, usuarioId);
    }

    @Get(':id/comentarios')
    async listarComentarios(
        @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
        @Query('offset') offset?: number,
        @Query('limit') limit?: number,
    ) {
        return this.publicacionesService.obtenerComentariosEsqueleto(
            id,
            Number(offset) || 0,
            Number(limit) || 10,
        );
    }
}