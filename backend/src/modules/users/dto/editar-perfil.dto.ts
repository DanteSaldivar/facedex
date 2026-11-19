import { IsOptional, IsString, IsEmail, MinLength, MaxLength, Matches, IsDateString, IsNotEmpty, } from 'class-validator';

export class EditarPerfilDto {
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  apellido?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  correo?: string;

  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser texto' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El nombre de usuario no puede tener más de 20 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El nombre de usuario solo puede contener letras, números y guión bajo',
  })
  nombreUsuario?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)' })
  fechaNacimiento?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
  descripcion?: string;
}