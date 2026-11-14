import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, HttpCode, HttpStatus } from '@nestjs/common';
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


@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador') // Todas las rutas exclusivas para Admin
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async listar(@Query() queryDto: QueryUsuariosDto) {
        return this.usersService.listar(queryDto);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('imagen'))
    async crear(
        @Body() dto: CrearUsuarioAdminDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.usersService.crearUsuarioPorAdmin(dto, file);
    }

    @Delete(':id')
    async deshabilitar(
        @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
        @UsuarioActual('id') adminId: string,
    ) {
        return this.usersService.deshabilitarUsuario(id, adminId);
    }

    @Post(':id/habilitar')
    @HttpCode(HttpStatus.OK)
    async habilitar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
        return this.usersService.habilitarUsuario(id);
    }
}