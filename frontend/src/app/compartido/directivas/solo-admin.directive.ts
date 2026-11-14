import { Directive, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appSoloAdmin]',
  standalone: true
})
export class SoloAdminDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  constructor() {
    effect(() => {
      const usuario = this.authService.usuarioActual();
      const esAdmin = usuario?.perfil === 'administrador';

      this.viewContainer.clear();
      if (esAdmin) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}