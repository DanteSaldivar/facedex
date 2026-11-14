import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'recortarTexto',
  standalone: true,
  pure: true
})
export class RecortarTexto implements PipeTransform {
  transform(texto: string | null | undefined, limite: number = 100): string {
    if (!texto) return '';
    if (texto.length <= limite) return texto;
    return `${texto.substring(0, limite).trim()}…`;
  }
}