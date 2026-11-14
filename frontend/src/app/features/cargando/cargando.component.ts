import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../compartido/services/modal.service';
import { Router } from '@angular/router';
import { reiniciarFlagModal401 } from '../../core/interceptors/auth.interceptor';
import { ButtonComponent } from '../../compartido/components/button/button.component';
import { SpinnerComponent } from '../../compartido/components/spinner/spinner.component';

@Component({
  imports: [ButtonComponent, SpinnerComponent],
  selector: 'app-cargando',
  styleUrl: './cargando.component.scss',
  templateUrl: './cargando.component.html',
})
export class CargandoComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private servicioModal = inject(ModalService);
  private router = inject(Router);

  readonly servidorDespertando = signal<boolean>(false);
  readonly errorConexion = signal<boolean>(false);

  private timerDespertar: any;

  ngOnInit(): void {
    this.validarSesionInicial();
  }

  ngOnDestroy(): void {
    if (this.timerDespertar) {
      clearTimeout(this.timerDespertar);
    }
  }

  validarSesionInicial(): void {
    this.errorConexion.set(false);
    this.servidorDespertando.set(false);

    // Si tarda más de 5 segundos, mostramos la advertencia del hosting
    this.timerDespertar = setTimeout(() => {
      this.servidorDespertando.set(true);
    }, 5000);

    this.authService.autorizar().subscribe({
      next: () => {
        if (this.timerDespertar) clearTimeout(this.timerDespertar);
        this.authService.cargandoInicial.set(false);
        reiniciarFlagModal401();
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        if (this.timerDespertar) clearTimeout(this.timerDespertar);
        this.authService.cargandoInicial.set(false);

        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.errorConexion.set(true);
          this.servicioModal.abrir({
            titulo: '¡ERROR DE CONEXIÓN!',
            mensaje: 'No pudimos conectar con el servidor de FaceDex. Por favor, verificá tu red e intentá nuevamente.',
            tipo: 'error',
            onomatopeya: '¡ZUUN!'
          });
        }
      }
    });
  }

  reintentar(): void {
    this.validarSesionInicial();
  }
}