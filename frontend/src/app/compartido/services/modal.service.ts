import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
  titulo: string;
  mensaje: string;
  tipo?: 'info' | 'exito' | 'error' | 'confirmacion' | 'sesion';
  onomatopeya?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  
  readonly estaAbierto = signal(false);
  readonly configuracion = signal<ModalConfig | null>(null);

  private resolverPromesa: ((resultado: boolean) => void) | null = null;

  /**
   * Abre un modal de aviso o información simple.
   */
  abrir(config: ModalConfig): void {
    this.configuracion.set({
      tipo: 'info',
      textoConfirmar: '¡ENTENDIDO!',
      textoCancelar: 'CANCELAR',
      ...config
    });
    this.estaAbierto.set(true);
  }

  /**
   * Abre un modal de confirmación devolviendo una Promise<boolean>
   */
  confirmar(config: ModalConfig): Promise<boolean> {
    this.abrir({
      tipo: 'confirmacion',
      textoConfirmar: 'SÍ, CONTINUAR',
      textoCancelar: 'CANCELAR',
      ...config
    });

    return new Promise<boolean>((resolve) => {
      this.resolverPromesa = resolve;
    });
  }

  cerrar(resultado = false): void {
    this.estaAbierto.set(false);
    if (this.resolverPromesa) {
      this.resolverPromesa(resultado);
      this.resolverPromesa = null;
    }
  }

}
