import { IsOptional, IsIn, IsInt, Min, Max, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPublicacionesDto {
  @IsOptional()
  @IsIn(['fecha', 'likes'], { message: 'El campo orden debe ser "fecha" o "likes"' })
  orden?: 'fecha' | 'likes' = 'fecha';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El offset debe ser un número entero' })
  @Min(0, { message: 'El offset no puede ser menor a 0' })
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El limit debe ser un número entero' })
  @Min(1, { message: 'El limit debe ser como mínimo 1' })
  @Max(50, { message: 'El limit no puede superar 50' })
  limit?: number = 10;

  @IsOptional()
  @IsMongoId({ message: 'El usuarioId debe ser un ObjectId válido' })
  usuarioId?: string;
}