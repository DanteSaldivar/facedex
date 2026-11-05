import { HttpErrorResponse } from '@angular/common/http';
import { ErrorRespuestaBackend } from '../../core/models/auth.model';
import { ModalService } from '../../compartido/services/modal.service';

export function manejarErrorAutenticacion(errorHttp: HttpErrorResponse, servicioModal: ModalService): void {
  if (errorHttp.status === 0) {
    servicioModal.abrir({
      titulo: '¡SIN CONEXIÓN!',
      mensaje: 'No se pudo establecer conexión con el servidor. Verificá tu red e intentá nuevamente.',
      tipo: 'error',
      onomatopeya: '¡ZUUN!'
    });
    return;
  }

  const cuerpoError = errorHttp.error as ErrorRespuestaBackend;
  let mensajeFormateado = '';

  switch (errorHttp.status) {
    case 400:
      if (Array.isArray(cuerpoError?.message)) {
        mensajeFormateado = cuerpoError.message.map(msg => `• ${msg}`).join('\n');
      } else {
        mensajeFormateado = cuerpoError?.message || 'Los datos enviados son inválidos.';
      }
      servicioModal.abrir({
        titulo: '¡DATOS INVÁLIDOS!',
        mensaje: mensajeFormateado,
        tipo: 'error',
        onomatopeya: '¡NOOO!'
      });
      break;

    case 401:
      servicioModal.abrir({
        titulo: '¡CREDENCIALES INCORRECTAS!',
        mensaje: 'El usuario/correo o la contraseña no coinciden.',
        tipo: 'error',
        onomatopeya: '¡NOOO!'
      });
      break;

    case 403:
      servicioModal.abrir({
        titulo: '¡CUENTA DESHABILITADA!',
        mensaje: 'Tu cuenta ha sido deshabilitada por un administrador. Contactá a soporte.',
        tipo: 'error',
        onomatopeya: '¡NOOO!'
      });
      break;

    case 409:
      mensajeFormateado = typeof cuerpoError?.message === 'string'
        ? cuerpoError.message
        : 'El nombre de usuario o correo electrónico ya se encuentra registrado.';
      servicioModal.abrir({
        titulo: '¡REGISTRO DUPLICADO!',
        mensaje: mensajeFormateado,
        tipo: 'error',
        onomatopeya: '¡NOOO!'
      });
      break;

    default:
      servicioModal.abrir({
        titulo: '¡ERROR EN EL SERVIDOR!',
        mensaje: 'Ocurrió un error insospechado. Intentalo más tarde.',
        tipo: 'error',
        onomatopeya: '¡NOOO!'
      });
      break;
  }
}