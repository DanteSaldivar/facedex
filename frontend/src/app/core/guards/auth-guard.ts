import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rutas privadas (Publicaciones, Perfil, etc.)
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * Guard para redirigir usuarios ya logueados fuera de páginas públicas de Auth (Login, Registro)
 */
export const publicoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    router.navigate(['/publicaciones']);
    return false;
  }

  return true;
};