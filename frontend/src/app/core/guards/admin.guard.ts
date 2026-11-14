import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../../compartido/services/modal.service';


export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const servicioModal = inject(ModalService);
  const router = inject(Router);

  if (authService.cargandoInicial()) {
    return router.createUrlTree(['/cargando']);
  }

  const usuario = authService.usuarioActual();
  if (usuario && usuario.perfil === 'administrador') {
    return true;
  }

  servicioModal.abrir({
    titulo: '¡ACCESO RESTRINGIDO!',
    mensaje: 'No tenés permisos de administrador para entrar a esa sección.',
    tipo: 'error',
    onomatopeya: '¡UPPS?!'
  });

  return router.createUrlTree(['/publicaciones']);
};