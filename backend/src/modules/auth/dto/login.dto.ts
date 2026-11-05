import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El identificador (correo o usuario) es obligatorio' })
  @IsString()
  identificador?: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  password?: string;
}