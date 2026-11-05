import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../../compartido/services/modal.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const servicioModal = inject(ModalService);

  const token = authService.obtenerToken();

  // Clonamos la petición y agregamos el encabezado Authorization si existe el token
  let peticionClonada = req;
  if (token) {
    peticionClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(peticionClonada).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.cerrarSesion();
        servicioModal.abrir({
          titulo: '¡SESIÓN EXPIRADA!',
          mensaje: 'Tu token de acceso venció o no es válido. Por favor, volvé a iniciar sesión.',
          tipo: 'error',
          onomatopeya: '¡NOOO!'
        });
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};