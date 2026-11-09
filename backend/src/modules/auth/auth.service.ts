import { Injectable, ConflictException, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { UsersService } from '../users/users.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { LoginLog, LoginLogDocument } from './schemas/login-log.schema';
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service';
import { ConfigService } from '@nestjs/config';
import { AUTH_COOKIE_NAME, JWT_EXPIRES_IN_MS } from 'src/common/constantes/auth.constant';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
    private configService: ConfigService,
    @InjectModel(LoginLog.name) private loginLogModel: Model<LoginLogDocument>,
  ) { }

  // GALLETAS //

  private getCookieOptions() {
    const secure = this.configService.get<string>('COOKIE_SECURE') === 'true';
    const sameSiteRaw = (this.configService.get<string>('COOKIE_SAMESITE') || 'lax').toLowerCase();
    const sameSite = (['lax', 'strict', 'none'].includes(sameSiteRaw)
      ? sameSiteRaw
      : 'none') as 'lax' | 'strict' | 'none';

    return {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: JWT_EXPIRES_IN_MS,
    };
  }

  private setAuthCookieAndGetPayload(res: Response, usuario: any) {
    const token = this.generarToken(usuario);
    const options = this.getCookieOptions();

    res.cookie(AUTH_COOKIE_NAME, token, options);

    const expiraEn = Date.now() + JWT_EXPIRES_IN_MS;
    return {
      usuario: usuario.toJSON ? usuario.toJSON() : usuario,
      expiraEn,
    };  
  }




  async registro(dto: RegistroDto, res: Response, file?: Express.Multer.File) {
    if (dto.password !== dto.repetirPassword) {
      throw new BadRequestException(['Las contraseñas no coinciden']);
    }

    const fechaNac = new Date(dto.fechaNacimiento!);
    if (fechaNac > new Date()) {
      throw new BadRequestException(['La fecha de nacimiento no puede ser futura']);
    }

    const existeCorreo = await this.usersService.findByCorreo(dto.correo!);
    if (existeCorreo) {
      throw new ConflictException({
        statusCode: 409,
        message: 'El correo electrónico ya se encuentra registrado',
        error: 'Conflict',
      });
    }

    const existeUsername = await this.usersService.findByNombreUsuario(dto.nombreUsuario!);
    if (existeUsername) {
      throw new ConflictException({
        statusCode: 409,
        message: 'El nombre de usuario ya está en uso',
        error: 'Conflict',
      });
    }

    let imagenPerfil = '';
    let imagenPerfilPublicId = '';
    if (file) {
      const imagen = await this.cloudinaryService.subirImagen(file, 'usuarios');
      imagenPerfil = imagen.url;
      imagenPerfilPublicId = imagen.publicId;
    }

    const hashedPassword = await bcrypt.hash(dto.password!, 10);

    try {
      const nuevoUsuario = await this.usersService.create({
        nombre: dto.nombre,
        apellido: dto.apellido,
        correo: dto.correo,
        nombreUsuario: dto.nombreUsuario,
        password: hashedPassword,
        fechaNacimiento: fechaNac,
        descripcion: dto.descripcion,
        imagenPerfil,
        perfil: 'usuario',
        habilitado: true,
      });

      return this.setAuthCookieAndGetPayload(res, nuevoUsuario);

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

  async login(dto: LoginDto, res: Response) {
    const usuario = await this.usersService.findByIdentificador(dto.identificador!);

    if (!usuario) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Credenciales incorrectas',
        error: 'Unauthorized',
      });
    }

    const isMatch = await bcrypt.compare(dto.password!, usuario.password!);
    if (!isMatch) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Credenciales incorrectas',
        error: 'Unauthorized',
      });
    }

    if (!usuario.habilitado) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Tu cuenta está deshabilitada',
        error: 'Forbidden',
      });
    }

    await this.loginLogModel.create({
      usuario: usuario._id,
      fecha: new Date(),
    });

    return this.setAuthCookieAndGetPayload(res, usuario);
  }

  async autorizar(usuarioId: string) {
    const usuario = await this.usersService.findById(usuarioId);
    if (!usuario || !usuario.habilitado) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Sesión inválida o usuario deshabilitado',
        error: 'Unauthorized',
      });
    }

    const expiraEn = Date.now() + JWT_EXPIRES_IN_MS;
    return {
      usuario: usuario.toJSON(),
      expiraEn,
    };
  }

  async refrescarToken(usuarioId: string, res: Response) {
    const usuario = await this.usersService.findById(usuarioId);
    if (!usuario || !usuario.habilitado) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Sesión inválida o usuario deshabilitado',
        error: 'Unauthorized',
      });
    }

    return this.setAuthCookieAndGetPayload(res, usuario);
  }

  async logout(res: Response) {
    const options = this.getCookieOptions();
    // Limpieza con las mismas opciones 
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: options.httpOnly,
      secure: options.secure,
      sameSite: options.sameSite,
      path: options.path,
    });

    return { message: 'Sesión cerrada' };
  }

  private generarToken(usuario: any) {
    const payload = {
      sub: usuario._id,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
    return this.jwtService.sign(payload);
  }
}