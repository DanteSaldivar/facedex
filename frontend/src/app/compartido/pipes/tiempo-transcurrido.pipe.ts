import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoTranscurrido',
  standalone: true
})
export class TiempoTranscurridoPipe implements PipeTransform {
  transform(valorFecha: string | Date | undefined | null): string {
    if (!valorFecha) return 'hace un momento';

    const fechaEntrada = new Date(valorFecha);
    const ahora = new Date();
    const diferenciaMs = ahora.getTime() - fechaEntrada.getTime();

    if (isNaN(fechaEntrada.getTime()) || diferenciaMs < 0) {
      return 'hace un momento';
    }

    const segundos = Math.floor(diferenciaMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);
    const anos = Math.floor(dias / 365);

    if (segundos < 60) {
      return 'hace un momento';
    } else if (minutos < 60) {
      return `hace ${minutos} min`;
    } else if (horas < 24) {
      return `hace ${horas} h`;
    } else if (dias < 30) {
      return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    } else if (meses < 12) {
      return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
      return `hace ${anos} ${anos === 1 ? 'año' : 'años'}`;
    }
  }
}