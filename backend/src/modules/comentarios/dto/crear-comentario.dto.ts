import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CrearComentarioDto {
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @IsString({ message: 'El comentario debe ser texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(300, { message: 'El comentario no puede superar los 300 caracteres' })
  mensaje!: string;
}