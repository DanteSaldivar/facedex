import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { SesionService } from '../../core/services/sesion.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../compartido/components/button/button.component';

@Component({
  imports: [ButtonComponent],
  selector: 'app-error401',
  styleUrl: './error401.component.scss',
  templateUrl: './error401.component.html',
})
export class Error401Component {

  private authService = inject(AuthService);
  private sesionService = inject(SesionService);
  private router = inject(Router);

  volverALogin(): void {
    this.sesionService.cancelarTemporizadores();
    this.authService.limpiarEstadoMemoria();
    this.router.navigate(['/login']);
  }
  
}
