import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../../compartido/services/modal.service';
import { environment } from '../../../environments/environment';

let modalExpiracionAbierto = false;

export function reiniciarFlagModal401(): void {
  modalExpiracionAbierto = false;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const servicioModal = inject(ModalService);

  const esApiUrl = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api');


  const reqClonada = esApiUrl ? req.clone({ withCredentials: true }) : req;

  // 2. Procesar la petición y capturar errores 401 
  return next(reqClonada).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const esExcepcion401 =
          req.url.includes('/auth/login') ||
          req.url.includes('/auth/registro') ||
          req.url.includes('/auth/autorizar');

        const mensajeError = Array.isArray(error.error?.message)
          ? error.error.message.join(', ')
          : error.error?.message || '';

        const esCuentaDeshabilitada = mensajeError.toLowerCase().includes('deshabilitada');

        if (!esExcepcion401) {
          authService.limpiarEstadoMemoria();

          if (!modalExpiracionAbierto) {
            modalExpiracionAbierto = true;

            servicioModal.abrir({
              titulo: esCuentaDeshabilitada ? '¡CUENTA DESHABILITADA!' : '¡SESIÓN EXPIRADA!',
              mensaje: esCuentaDeshabilitada
                ? 'Tu cuenta ha sido deshabilitada por un administrador.'
                : 'Tu sesión en FaceDex expiró. Por favor, volvé a iniciar sesión.',
              tipo: 'error',
              onomatopeya: '¡UPS?!'
            });
          }

          router.navigate(['/login']);
        }
      }

      if (error.status === 403 && !req.url.includes('/auth/login')) {
        const mensajeError = Array.isArray(error.error?.message)
          ? error.error.message.join(', ')
          : error.error?.message || 'No tenés permisos para realizar esta acción.';

        servicioModal.abrir({
          titulo: '¡ACCESO DENEGADO!',
          mensaje: mensajeError,
          tipo: 'error',
          onomatopeya: '¡SRYY?!'
        });
      }

      return throwError(() => error);
    })
  );
};