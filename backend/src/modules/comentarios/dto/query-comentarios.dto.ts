import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryComentariosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El offset debe ser un número entero' })
  @Min(0, { message: 'El offset no puede ser menor a 0' })
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El limit debe ser un número entero' })
  @Min(1, { message: 'El limit debe ser como mínimo 1' })
  @Max(50, { message: 'El limit no puede superar los 50 elementos' })
  limit?: number = 10;
}