import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ModalService } from '../../../compartido/services/modal.service';
import { InputComponent } from '../../../compartido/components/input/input.component';
import { ButtonComponent } from '../../../compartido/components/button/button.component';
import { AuthService } from '../../../core/services/auth.service';
import { manejarErrorAutenticacion } from '../../utils/manejador-errores-auth';

@Component({
  imports: [ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  selector: 'app-login',
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html',
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private servicioModal = inject(ModalService);
  private authService = inject(AuthService);

  cargando = signal<boolean>(false);

  // Validación de contraseña: min 8 caracteres, 1 mayúscula, 1 número
  formularioLogin = this.fb.nonNullable.group({
    usuarioOCorreo: ['', [Validators.required]],
    contrasena: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    ]]
  });

  esCampoInvalido(nombreCampo: 'usuarioOCorreo' | 'contrasena'): boolean {
    const campo = this.formularioLogin.get(nombreCampo);
    return !!(campo && campo.invalid && (campo.touched || campo.dirty));
  }

  obtenerMensajeError(nombreCampo: 'usuarioOCorreo' | 'contrasena'): string {
    const campo = this.formularioLogin.get(nombreCampo);
    if (!campo || !campo.errors) return '';

    if (campo.errors['required']) return 'Este campo es obligatorio.';
    if (campo.errors['minlength']) return 'Debe tener al menos 8 caracteres.';
    if (campo.errors['pattern']) return 'Requiere al menos una mayúscula y un número.';
    return '';
  }

  alEnviar(): void {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.cargando.set(true);

    const { usuarioOCorreo, contrasena } = this.formularioLogin.getRawValue();

    

    // Envío exacto al contrato con identificador
    this.authService.login({ identificador: usuarioOCorreo, password: contrasena }).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.servicioModal.abrir({
          titulo: '¡BIENVENIDO DE NUEVO!',
          mensaje: `¡Hola de nuevo, ${respuesta.usuario.nombreUsuario}!`,
          tipo: 'exito',
          onomatopeya: '¡SUGOI!'
        });
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.cargando.set(false);
        manejarErrorAutenticacion(err, this.servicioModal);
      }
    });
  }

}
