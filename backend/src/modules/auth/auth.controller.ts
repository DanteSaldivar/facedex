import { Controller, Post, Body, UseInterceptors, UploadedFile, HttpCode, HttpStatus, UseGuards, Res, } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UsuarioActual } from 'src/common/decoradores/usuario-actual.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagen'))
  async registro(
    @Body() registroDto: RegistroDto,
    @Res({ passthrough: true }) res: Response,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.registro(registroDto, res, file);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  @Post('autorizar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async autorizar(@UsuarioActual('id') usuarioId: string) {
    return this.authService.autorizar(usuarioId);
  }

  @Post('refrescar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refrescar(
    @UsuarioActual('id') usuarioId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refrescarToken(usuarioId, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}