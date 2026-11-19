import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { QueryUsuariosDto } from './dto/query-usuarios.dto.js';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decoradores/roles.decotor.js';
import { UsersService } from './services/users.service.js';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objet-id/parse-objet-id.pipe.js';
import { UsuarioActual } from '../../common/decoradores/usuario-actual.decorator.js';
import { EditarPerfilDto } from './dto/editar-perfil.dto.js';


@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles('administrador')
    async listar(@Query() queryDto: QueryUsuariosDto) {
        return this.usersService.listar(queryDto);
    }

    @Post()
    @Roles('administrador')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('imagen'))
    async crear(
        @Body() dto: CrearUsuarioAdminDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.usersService.crearUsuarioPorAdmin(dto, file);
    }

    @Delete(':id')
    @Roles('administrador')
    async deshabilitar(
        @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
        @UsuarioActual('id') adminId: string,
    ) {
        return this.usersService.deshabilitarUsuario(id, adminId);
    }

    @Post(':id/habilitar')
    @Roles('administrador')
    @HttpCode(HttpStatus.OK)
    async habilitar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
        return this.usersService.habilitarUsuario(id);
    }

    @Patch('perfil')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('imagen'))
    async editarPerfil(
        @UsuarioActual('id') usuarioId: string,
        @Body() dto: EditarPerfilDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.usersService.editarPerfil(usuarioId, dto, file);
    }
}