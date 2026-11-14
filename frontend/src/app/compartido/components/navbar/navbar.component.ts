import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../services/modal.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { Router, RouterLink } from '@angular/router';
import { SesionService } from '../../../core/services/sesion.service';
import { SoloAdminDirective } from '../../directivas/solo-admin.directive';
import { ResaltarDirective } from '../../directivas/resaltar.directive';

@Component({
  imports: [AvatarComponent, RouterLink, SoloAdminDirective, ResaltarDirective],
  selector: 'app-navbar',
  styleUrl: './navbar.component.scss',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {

  authService = inject(AuthService);
  private servicioModal = inject(ModalService);
  private sesionService = inject(SesionService);
  menuAbierto = signal<boolean>(false);
  modoOscuro = signal<boolean>(false);
  router = inject(Router);

  toggleMenu(): void {
    this.menuAbierto.update(v => !v);
  }

  toggleModoOscuro(): void {
    this.modoOscuro.update(v => !v);
    if (this.modoOscuro()) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  async confirmarCierreSesion(): Promise<void> {
    const confirmado = await this.servicioModal.confirmar({
      titulo: '¿CERRAR SESIÓN?',
      mensaje: '¿Estás seguro de que querés salir de faceDex?',
      tipo: 'confirmacion',
      onomatopeya: '¡PIUM?!',
      textoConfirmar: 'Sí, salir',
      textoCancelar: 'Cancelar',
    });


   if (confirmado) {
    this.sesionService.cancelarTemporizadores();

    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }

  }
}
