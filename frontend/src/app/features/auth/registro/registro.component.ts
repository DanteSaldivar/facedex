import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { coincidenContrasenasValidador, fechaNoFuturaValidador } from '../../utils/validadores';
import { ButtonComponent } from '../../../compartido/components/button/button.component';
import { ModalService } from '../../../compartido/services/modal.service';
import { InputComponent } from '../../../compartido/components/input/input.component';
import { AuthService } from '../../../core/services/auth.service';
import { manejarErrorAutenticacion } from '../../utils/manejador-errores-auth';
import { SpinnerComponent } from '../../../compartido/components/spinner/spinner.component';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent, SpinnerComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private servicioModal = inject(ModalService);

  readonly cargando = signal<boolean>(false);

  readonly vistaPreviaFoto = signal<string | null>(null);
  readonly archivoFotoSeleccionado = signal<File | null>(null);
  readonly errorArchivo = signal<string | null>(null);

  formularioRegistro = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(/^[a-zA-Z0-9_]+$/)
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    ]],
    repetirPassword: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required, fechaNoFuturaValidador()]],
    descripcion: ['', [Validators.maxLength(200)]]
  }, {
    validators: coincidenContrasenasValidador()
  });

  esCampoInvalido(nombreCampo: string): boolean {
    const campo = this.formularioRegistro.get(nombreCampo);
    if (!campo) return false;

    if (nombreCampo === 'repetirPassword') {
    const noCoinciden = this.formularioRegistro.hasError('noCoinciden') || campo.hasError('noCoinciden');
    return (campo.touched || campo.dirty) && (campo.invalid || noCoinciden);
  }

    return !!(campo.invalid && (campo.touched || campo.dirty));
  }

  obtenerMensajeError(nombreCampo: string): string {
    if (nombreCampo === 'repetirPassword' && this.formularioRegistro.hasError('noCoinciden')) {
      return 'Las contraseñas no coinciden.';
    }

    const campo = this.formularioRegistro.get(nombreCampo);
    if (!campo || !campo.errors) return '';

    if (campo.errors['required']) return 'Este campo es obligatorio.';
    if (campo.errors['email']) return 'Formato de correo electrónico inválido.';
    if (campo.errors['minlength']) return `Mínimo ${campo.errors['minlength'].requiredLength} caracteres.`;
    if (campo.errors['maxlength']) return `Máximo ${campo.errors['maxlength'].requiredLength} caracteres.`;
    if (campo.errors['pattern']) {
      return nombreCampo === 'nombreUsuario'
        ? 'Solo se permiten letras, números y guion bajo (_).'
        : 'Requiere al menos una mayúscula y un número.';
    }
    if (campo.errors['fechaFutura']) return 'La fecha no puede ser futura.';
    return '';
  }

  alSeleccionarFoto(evento: Event): void {
    this.errorArchivo.set(null);
    const input = evento.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const archivo = input.files[0];
      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
      const tamanoMaximo = 5 * 1024 * 1024; // 5 MB

      if (!tiposPermitidos.includes(archivo.type)) {
        this.errorArchivo.set('Formato inválido. Solo se admiten JPG, PNG o WEBP.');
        return;
      }

      if (archivo.size > tamanoMaximo) {
        this.errorArchivo.set('La imagen de perfil no puede pesar más de 5 MB.');
        return;
      }

      this.archivoFotoSeleccionado.set(archivo);
      const lector = new FileReader();
      lector.onload = () => this.vistaPreviaFoto.set(lector.result as string);
      lector.readAsDataURL(archivo);
    }
  }

  quitarFoto(): void {
    this.archivoFotoSeleccionado.set(null);
    this.vistaPreviaFoto.set(null);
    this.errorArchivo.set(null);
  }


  alEnviar(): void {
    // 1. Si el formulario tiene errores, marcamos todo como touched y avisamos al usuario
    if (this.formularioRegistro.invalid) {
      this.formularioRegistro.markAllAsTouched();

      this.servicioModal.abrir({
        titulo: '¡CAMPOS INCOMPLETOS!',
        mensaje: 'Por favor, revisá los campos marcados en rojo antes de continuar.',
        tipo: 'error',
        onomatopeya: '¡NOOO!'
      });
      return;
    }

    this.cargando.set(true);

    const val = this.formularioRegistro.getRawValue();
    const archivoSeleccionado = this.archivoFotoSeleccionado();

    // Construimos el payload en FormData porque el backend espera multipart/form-data
    const datosRegistro = new FormData();
    datosRegistro.append('nombre', val.nombre);
    datosRegistro.append('apellido', val.apellido);
    datosRegistro.append('correo', val.correo);
    datosRegistro.append('nombreUsuario', val.nombreUsuario);
    datosRegistro.append('password', val.password);
    datosRegistro.append('repetirPassword', val.repetirPassword);
    datosRegistro.append('fechaNacimiento', val.fechaNacimiento);
    datosRegistro.append('descripcion', val.descripcion ?? '');

    if (archivoSeleccionado) {
      datosRegistro.append('imagen', archivoSeleccionado, archivoSeleccionado.name);
    }

    // 2. Envío al servicio HTTP de autenticación
    this.authService.registro(datosRegistro).subscribe({
      next: () => {
        this.cargando.set(false);

        // Modal de éxito y redirección al login
        this.servicioModal.abrir({
          titulo: '¡CUENTA CREADA!',
          mensaje: 'Tu usuario ha sido registrado exitosamente en faceDEX. Ya podés iniciar sesión.',
          tipo: 'exito',
          onomatopeya: '¡SUGOI!'
        });

        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.cargando.set(false);
        // Capturamos errores como "El correo ya está registrado" o 400 del backend
        manejarErrorAutenticacion(err, this.servicioModal);
      }
    });
  }
}