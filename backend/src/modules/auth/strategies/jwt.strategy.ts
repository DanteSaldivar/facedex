import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../../modules/users/users.service.js';
import { AUTH_COOKIE_NAME } from '../../../common/constantes/auth.constant.js';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      // 7. Extraer primero de cookie y respaldo de Authorization Bearer
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token: string | null = null;
          if (req && req.cookies) {
            token = req.cookies[AUTH_COOKIE_NAME] ?? null;
          }
          if (!token) {
            token = ExtractJwt.fromAuthHeaderAsBearerToken()(req) ?? null;
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
  const usuario = await this.usersService.findById(payload.sub);

  if (!usuario || !usuario.habilitado) {
    throw new UnauthorizedException({
      statusCode: 401,
      message: 'Sesión inválida o usuario deshabilitado',
      error: 'Unauthorized',
    });
  }

  // Devolvemos _id e id para evitar discrepancias
  return {
    _id: usuario._id.toString(),
    id: usuario._id.toString(),
    correo: usuario.correo,
    nombreUsuario: usuario.nombreUsuario,
    perfil: usuario.perfil,
  };
}
}