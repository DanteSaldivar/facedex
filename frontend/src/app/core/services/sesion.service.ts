import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { ModalService } from '../../compartido/services/modal.service';

@Injectable({
  providedIn: 'root'
})
export class SesionService {
  private authService = inject(AuthService);
  private servicioModal = inject(ModalService);
  private router = inject(Router);

  private timerAviso: any = null;
  private timerExpiracionReal: any = null;
  private avisoModalAbierto = false;

  iniciarControlSesion(expiraEnMs: number): void {
    this.cancelarTemporizadores();

    const ahora = Date.now();
    const tiempoRestanteMs = expiraEnMs - ahora;

    if (tiempoRestanteMs <= 0) {
      this.ejecutarExpiracionSesion();
      return;
    }

    const tiempoAvisoMs = environment.avisoSesionAntesDeVencerMs; // 5 minutos por defecto
    const tiempoHastaAviso = tiempoRestanteMs - tiempoAvisoMs;

    console.log(
      `[SesionService] Sesión vence en ${Math.round(tiempoRestanteMs / 1000)}s. ` +
      `Aviso programado en ${Math.round(tiempoHastaAviso / 1000)}s.`
    );

    // 1. Programar Expiración Real
    this.timerExpiracionReal = setTimeout(() => {
      this.ejecutarExpiracionSesion();
    }, tiempoRestanteMs);

    // 2. Programar Aviso
    if (tiempoHastaAviso <= 0) {
      this.mostrarAvisoExtenderSesion();
    } else {
      this.timerAviso = setTimeout(() => {
        this.mostrarAvisoExtenderSesion();
      }, tiempoHastaAviso);
    }
  }

  private async mostrarAvisoExtenderSesion(): Promise<void> {
    if (this.avisoModalAbierto) return;
    this.avisoModalAbierto = true;

    const respuesta = await this.servicioModal.confirmar({
      titulo: '¿EXTENDER SESIÓN?',
      mensaje: 'Te quedan menos de 5 minutos de sesión en FaceDex. ¿Querés extender tu tiempo?',
      tipo: 'confirmacion',
      onomatopeya: '¡WAIT!',
      textoConfirmar: '¡SÍ, EXTENDER!',
      textoCancelar: 'NO, GRACIAS'
    });

    this.avisoModalAbierto = false;

    if (respuesta) {
      this.refrescarSesion();
    }
  }

  private refrescarSesion(): void {
    this.authService.refrescar().subscribe({
      next: (res) => {
        // Reprogramamos temporizadores con el nuevo timestamp expiraEn
        this.iniciarControlSesion(res.expiraEn);
      },
      error: () => {
        this.ejecutarExpiracionSesion();
      }
    });
  }

  private ejecutarExpiracionSesion(): void {
    this.cancelarTemporizadores();
    this.servicioModal.cerrarModalAbierto();
    this.authService.limpiarEstadoMemoria();

    this.servicioModal.abrir({
      titulo: '¡SESIÓN EXPIRADA!',
      mensaje: 'Tu sesión en FaceDex ha vencido. Por favor, volvé a iniciar sesión.',
      tipo: 'error',
      onomatopeya: '¡Zaps?!'
    });

    this.router.navigate(['/login']);
  }

  cancelarTemporizadores(): void {
    if (this.timerAviso) {
      clearTimeout(this.timerAviso);
      this.timerAviso = null;
    }
    if (this.timerExpiracionReal) {
      clearTimeout(this.timerExpiracionReal);
      this.timerExpiracionReal = null;
    }
    this.avisoModalAbierto = false;
  }
}