import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema.js';
import { CloudinaryService } from '../../../common/services/cloudinary/cloudinary.service.js';
import { CrearUsuarioAdminDto } from '../dto/crear-usuario-admin.dto.js';
import { QueryUsuariosDto } from '../dto/query-usuarios.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private cloudinaryService: CloudinaryService,
    ) { }

    async findByCorreo(correo: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ correo: correo.toLowerCase() }).select('+password').exec();
    }

    async findByNombreUsuario(nombreUsuario: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ nombreUsuario }).select('+password').exec();
    }

    async findByIdentificador(identificador: string): Promise<UserDocument | null> {
        const ident = identificador.toLowerCase();
        return this.userModel
            .findOne({
                $or: [{ correo: ident }, { nombreUsuario: identificador }],
            })
            .select('+password')
            .exec();
    }

    async findById(id: string): Promise<UserDocument | null> {
        if (!Types.ObjectId.isValid(id)) return null;
        return this.userModel.findById(id).exec();
    }

    async create(userData: Partial<User>): Promise<UserDocument> {
        const newUser = new this.userModel(userData);
        return newUser.save();
    }

    // Método reutilizado por el alta de administradores y registro público
    async crearUsuarioPorAdmin(dto: CrearUsuarioAdminDto, file?: Express.Multer.File) {
        if (!dto.fechaNacimiento || !dto.correo || !dto.nombreUsuario || !dto.password || !dto.repetirPassword) {
            throw new BadRequestException(['Faltan datos obligatorios']);
        }

        if (dto.password !== dto.repetirPassword) {
            throw new BadRequestException(['Las contraseñas no coinciden']);
        }

        const fechaNac = new Date(dto.fechaNacimiento);
        if (Number.isNaN(fechaNac.getTime())) {
            throw new BadRequestException(['La fecha de nacimiento no es válida']);
        }
        if (fechaNac > new Date()) {
            throw new BadRequestException(['La fecha de nacimiento no puede ser futura']);
        }

        const existeCorreo = await this.findByCorreo(dto.correo);
        if (existeCorreo) {
            throw new ConflictException({
                statusCode: 409,
                message: 'El correo electrónico ya se encuentra registrado',
                error: 'Conflict',
            });
        }

        const existeUsername = await this.findByNombreUsuario(dto.nombreUsuario);
        if (existeUsername) {
            throw new ConflictException({
                statusCode: 409,
                message: 'El nombre de usuario ya está en uso',
                error: 'Conflict',
            });
        }

        let imagenPerfil = '';
        if (file) {
            const imagenSubida = await this.cloudinaryService.subirImagen(file, 'usuarios');
            imagenPerfil = imagenSubida.url;
        }

        const hashedPassword = bcrypt.hashSync(dto.password, 10);

        try {
            const nuevoUsuario = await this.create({
                nombre: dto.nombre,
                apellido: dto.apellido,
                correo: dto.correo,
                nombreUsuario: dto.nombreUsuario,
                password: hashedPassword,
                fechaNacimiento: fechaNac,
                descripcion: dto.descripcion,
                imagenPerfil,
                perfil: dto.perfil,
                habilitado: true,
            });

            return nuevoUsuario.toJSON();
        } catch (error: any) {
            if (error.code === 11000) {
                const campoRepetido = Object.keys(error.keyPattern || {})[0] || 'campo';
                throw new ConflictException({
                    statusCode: 409,
                    message: `El ${campoRepetido} ya se encuentra registrado`,
                    error: 'Conflict',
                });
            }
            throw error;
        }
    }

    async listar(queryDto: QueryUsuariosDto) {
        const { offset = 0, limit = 10, buscar } = queryDto;
        const filtro: any = {};

        if (buscar && buscar.trim() !== '') {
            // Escapar caracteres especiales de Regex
            const busquedaEscapada = buscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(busquedaEscapada, 'i');
            filtro.$or = [
                { nombre: regex },
                { apellido: regex },
                { correo: regex },
                { nombreUsuario: regex },
            ];
        }

        const total = await this.userModel.countDocuments(filtro);
        const usuarios = await this.userModel
            .find(filtro)
            .sort({ createdAt: -1, _id: -1 })
            .skip(offset)
            .limit(limit)
            .exec();

        const items = usuarios.map((u) => u.toJSON());

        return { items, total, offset, limit };
    }

    async deshabilitarUsuario(id: Types.ObjectId, adminId: string) {
        if (id.toString() === adminId) {
            throw new ForbiddenException({
                statusCode: 403,
                message: 'Un administrador no puede deshabilitarse a sí mismo',
                error: 'Forbidden',
            });
        }

        const usuario = await this.userModel.findById(id);
        if (!usuario) {
            throw new NotFoundException({
                statusCode: 404,
                message: 'El usuario no existe',
                error: 'Not Found',
            });
        }

        if (!usuario.habilitado) {
            throw new ConflictException({
                statusCode: 409,
                message: 'El usuario ya se encuentra deshabilitado',
                error: 'Conflict',
            });
        }

        // Verificar si es el último administrador habilitado
        if (usuario.perfil === 'administrador') {
            const adminsHabilitados = await this.userModel.countDocuments({
                perfil: 'administrador',
                habilitado: true,
            });

            if (adminsHabilitados <= 1) {
                throw new ConflictException({
                    statusCode: 409,
                    message: 'No se puede deshabilitar al último administrador habilitado del sistema',
                    error: 'Conflict',
                });
            }
        }

        usuario.habilitado = false;
        await usuario.save();

        return {
            message: 'Usuario deshabilitado correctamente',
            usuario: usuario.toJSON(),
        };
    }

    async habilitarUsuario(id: Types.ObjectId) {
        const usuario = await this.userModel.findById(id);
        if (!usuario) {
            throw new NotFoundException({
                statusCode: 404,
                message: 'El usuario no existe',
                error: 'Not Found',
            });
        }

        if (usuario.habilitado) {
            throw new ConflictException({
                statusCode: 409,
                message: 'El usuario ya se encuentra habilitado',
                error: 'Conflict',
            });
        }

        usuario.habilitado = true;
        await usuario.save();

        return {
            message: 'Usuario habilitado correctamente',
            usuario: usuario.toJSON(),
        };
    }
}