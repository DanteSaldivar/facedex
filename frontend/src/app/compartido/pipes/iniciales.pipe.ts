import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iniciales',
  standalone: true,
  pure: true
})
export class InicialesPipe implements PipeTransform {
  transform(nombre?: string | null, apellido?: string | null): string {
    const primerLetra = nombre?.trim().charAt(0).toUpperCase() || '';
    const segundaLetra = apellido?.trim().charAt(0).toUpperCase() || '';
    const resultado = `${primerLetra}${segundaLetra}`;
    return resultado || '?';
  }
}