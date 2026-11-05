import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function coincidenContrasenasValidador(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;

    if (!password || !repetirPassword) {
      return null;
    }

    if (password !== repetirPassword) {
      // Seteamos el error manualmente 
      control.get('repetirPassword')?.setErrors({ noCoinciden: true });
      return { noCoinciden: true };
    } else {
      // Si coinciden, limpiamos el error 'noCoinciden' si existía
      const errores = control.get('repetirPassword')?.errors;
      if (errores) {
        delete errores['noCoinciden'];
        const tieneMasErrores = Object.keys(errores).length > 0;
        control.get('repetirPassword')?.setErrors(tieneMasErrores ? errores : null);
      }
      return null;
    }
  };
}
export function fechaNoFuturaValidador(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const fechaSeleccionada = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada > hoy) {
      return { fechaFutura: true };
    }
    return null;
  };
}