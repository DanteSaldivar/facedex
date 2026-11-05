import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHttpBackend } from '../../core/models/error-backend.model';
import { ModalService } from '../../compartido/services/modal.service';


export function manejarErrorHttp(errorHttp: HttpErrorResponse, servicioModal: ModalService): void {
  if (errorHttp.status === 0) {
    servicioModal.abrir({
      titulo: '¡SIN CONEXIÓN!',
      mensaje: 'No se pudo conectar con el servidor de Manga-Kai. Verificá tu red e intentá nuevamente.',
      tipo: 'error',
      onomatopeya: '¡ZUUN!'
    });
    return;
  }

  const cuerpo = errorHttp.error as ErrorHttpBackend;
  let mensajeDetalle = '';

  if (cuerpo && cuerpo.message) {
    if (Array.isArray(cuerpo.message)) {
      mensajeDetalle = cuerpo.message.map(m => `• ${m}`).join('\n');
    } else {
      mensajeDetalle = cuerpo.message;
    }
  }

  switch (errorHttp.status) {
    case 400:
      servicioModal.abrir({
        titulo: '¡DATOS INVÁLIDOS!',
        mensaje: mensajeDetalle || 'La petición enviada contiene datos incorrectos o inválidos.',
        tipo: 'error',
        onomatopeya: '¡NOOO!'
      });
      break;

    case 401:
      servicioModal.abrir({
        titulo: '¡SESIÓN EXPIRADA!',
        mensaje: 'Tu sesión no es válida o ha caducado. Volvé a ingresar.',
        tipo: 'error',
        onomatopeya: '¡NOOO!'
      });
      break;

    case 403:
      servicioModal.abrir({
        titulo: '¡PERMISOS INSUFICIENTES!',
        mensaje: mensajeDetalle || 'No tenés autorización para realizar esta acción sobre el recurso.',
        tipo: 'error',
        onomatopeya: '¡NOOO!'
      });
      break;

    case 404:
      servicioModal.abrir({
        titulo: '¡PUBLICACIÓN NO ENCONTRADA!',
        mensaje: mensajeDetalle || 'La publicación a la que intentás acceder o modificar ya no existe.',
        tipo: 'error',
        onomatopeya: '¡QUE PASO?!'
      });
      break;

    case 409:
      servicioModal.abrir({
        titulo: '¡CONFLICTO DE ACCIÓN!',
        mensaje: mensajeDetalle || 'Ocurrió un conflicto procesando tu solicitud.',
        tipo: 'error',
        onomatopeya: '¡NOOO!'
      });
      break;

    default:
      servicioModal.abrir({
        titulo: '¡ERROR INESPERADO!',
        mensaje: mensajeDetalle || 'Ocurrió un error en el servidor. Intentá más tarde.',
        tipo: 'error',
        onomatopeya: '¡NOOO!'
      });
      break;
  }
}