import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título debe ser un texto' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres' })
  titulo?: string;

  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @IsString({ message: 'El mensaje debe ser un texto' })
  @MaxLength(500, { message: 'El mensaje no puede superar los 500 caracteres' })
  mensaje?: string;
}