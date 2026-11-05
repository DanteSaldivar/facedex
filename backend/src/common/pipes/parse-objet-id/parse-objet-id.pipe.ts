import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string): Types.ObjectId {
    const valid = Types.ObjectId.isValid(value);
    if (!valid) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'El ID ingresado no tiene un formato válido',
        error: 'Bad Request',
      });
    }
    return new Types.ObjectId(value);
  }
}