import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryRangoFechasDto } from './query-rango-fechas.dto.js';

export class QueryEstadisticaPubDto extends QueryRangoFechasDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El limit debe ser un número entero' })
  @Min(1, { message: 'El limit debe ser como mínimo 1' })
  @Max(20, { message: 'El limit no puede superar 20' })
  limit?: number = 10;
}