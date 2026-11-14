import { IsNotEmpty, IsDateString } from 'class-validator';

export class QueryRangoFechasDto {
  @IsNotEmpty({ message: 'La fecha desde es obligatoria' })
  @IsDateString({}, { message: 'La fecha desde debe tener formato YYYY-MM-DD' })
  desde?: string;

  @IsNotEmpty({ message: 'La fecha hasta es obligatoria' })
  @IsDateString({}, { message: 'La fecha hasta debe tener formato YYYY-MM-DD' })
  hasta?: string;
}