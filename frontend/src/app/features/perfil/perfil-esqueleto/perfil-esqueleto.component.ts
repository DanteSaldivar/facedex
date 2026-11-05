import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { AvatarComponent } from '../../../compartido/components/avatar/avatar.component';
import { DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  imports: [AvatarComponent, DatePipe, UpperCasePipe],
  selector: 'app-perfil-esqueleto',
  styleUrl: './perfil-esqueleto.component.scss',
  templateUrl: './perfil-esqueleto.component.html',
})
export class PerfilEsqueletoComponent {

  authService = inject(AuthService);

  get usuario() {
    return this.authService.usuarioActual();
  }

}
