import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuariosService } from '../../../compartido/services/usuarios.service';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../compartido/services/modal.service';
import { Usuario } from '../../../core/models/usuario.model';
import { coincidenContrasenasValidador, fechaNoFuturaValidador } from '../../utils/validadores';
import { AvatarComponent } from '../../../compartido/components/avatar/avatar.component';
import { ButtonComponent } from '../../../compartido/components/button/button.component';
import { InputComponent } from '../../../compartido/components/input/input.component';
import { SpinnerComponent } from '../../../compartido/components/spinner/spinner.component';
import { AutofocusDirective } from '../../../compartido/directivas/autofocus.directive';
import { ResaltarDirective } from '../../../compartido/directivas/resaltar.directive';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule,AvatarComponent,ButtonComponent,InputComponent,SpinnerComponent,AutofocusDirective,ResaltarDirective, UpperCasePipe],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private authService = inject(AuthService);
  private servicioModal = inject(ModalService);
  private fb = inject(FormBuilder);

  readonly usuarios = signal<Usuario[]>([]);
  readonly total = signal<number>(0);
  readonly offset = signal<number>(0);
  readonly limit = 10;
  readonly busqueda = signal<string>('');

  readonly cargando = signal<boolean>(true);
  readonly procesandoId = signal<string | null>(null);
  readonly mostrarModalAlta = signal<boolean>(false);
  readonly enviandoAlta = signal<boolean>(false);

  // Foto de perfil opcional para alta de usuario por el Admin
  readonly vistaPreviaFoto = signal<string | null>(null);
  readonly archivoFotoSeleccionado = signal<File | null>(null);

  formAlta = this.fb.nonNullable.group({
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
    descripcion: ['', [Validators.maxLength(200)]],
    perfil: ['usuario', [Validators.required]]
  }, {
    validators: coincidenContrasenasValidador()
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  get usuarioActualId(): string | undefined {
    return this.authService.usuarioActual()?._id;
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuariosService.listar(this.offset(), this.limit, this.busqueda()).subscribe({
      next: (res) => {
        this.usuarios.set(res.items);
        this.total.set(res.total);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  alBuscar(texto: string): void {
    this.busqueda.set(texto);
    this.offset.set(0); // Volver a la página 1 al buscar (Requisito 9)
    this.cargarUsuarios();
  }

  paginaSiguiente(): void {
    if (this.offset() + this.limit < this.total()) {
      this.offset.update(o => o + this.limit);
      this.cargarUsuarios();
    }
  }

  paginaAnterior(): void {
    if (this.offset() > 0) {
      this.offset.update(o => o - this.limit);
      this.cargarUsuarios();
    }
  }

  async toggleEstadoUsuario(usr: Usuario): Promise<void> {
    // Evitar deshabilitarse a uno mismo
    if (usr._id === this.usuarioActualId) return;

    const accion = usr.habilitado !== false ? 'deshabilitar' : 'habilitar';
    const confirmado = await this.servicioModal.confirmar({
      titulo: `¿${accion.toUpperCase()} USUARIO?`,
      mensaje: `¿Estás seguro de que querés ${accion} a @${usr.nombreUsuario}?`,
      tipo: 'confirmacion',
      onomatopeya: '¡WAIT!',
      textoConfirmar: `SÍ, ${accion.toUpperCase()}`,
      textoCancelar: 'CANCELAR'
    });

    if (!confirmado) return;

    this.procesandoId.set(usr._id);

    const peticion$ = usr.habilitado !== false
      ? this.usuariosService.deshabilitar(usr._id)
      : this.usuariosService.habilitar(usr._id);

    peticion$.subscribe({
      next: (res) => {
        this.procesandoId.set(null);
        // Actualización local de la fila (Requisito 10)
        this.usuarios.update(lista =>
          lista.map(u => u._id === usr._id ? res.usuario : u)
        );
        this.servicioModal.abrir({
          titulo: '¡ESTADO ACTUALIZADO!',
          mensaje: `El usuario @${usr.nombreUsuario} fue ${accion}do exitosamente.`,
          tipo: 'exito',
          onomatopeya: '¡SUGOI!'
        });
      },
      error: (err) => {
        this.procesandoId.set(null);
        if (err.status === 403 || err.status === 409) {
          const msj = Array.isArray(err.error?.message) 
            ? err.error.message.join(', ') 
            : err.error?.message || 'No se pudo cambiar el estado del usuario.';
          
          this.servicioModal.abrir({
            titulo: '¡ACCIÓN IMPOSIBLE!',
            mensaje: msj,
            tipo: 'error',
            onomatopeya: '¡NANI?!'
          });
        }
      }
    });
  }

  abrirModalAlta(): void {
    this.formAlta.reset({ perfil: 'usuario' });
    this.vistaPreviaFoto.set(null);
    this.archivoFotoSeleccionado.set(null);
    this.mostrarModalAlta.set(true);
  }

  cerrarModalAlta(): void {
    this.mostrarModalAlta.set(false);
  }

  alSeleccionarFoto(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const archivo = input.files[0];
      this.archivoFotoSeleccionado.set(archivo);

      const lector = new FileReader();
      lector.onload = () => this.vistaPreviaFoto.set(lector.result as string);
      lector.readAsDataURL(archivo);
    }
  }

  guardarUsuario(): void {
    this.formAlta.updateValueAndValidity();

    if (this.formAlta.invalid) {
      this.formAlta.markAllAsTouched();
      return;
    }

    this.enviandoAlta.set(true);
    const val = this.formAlta.getRawValue();

    const formData = new FormData();
    formData.append('nombre', val.nombre.trim());
    formData.append('apellido', val.apellido.trim());
    formData.append('correo', val.correo.trim().toLowerCase());
    formData.append('nombreUsuario', val.nombreUsuario.trim());
    formData.append('password', val.password);
    formData.append('repetirPassword', val.repetirPassword);
    formData.append('fechaNacimiento', val.fechaNacimiento);
    formData.append('perfil', val.perfil);

    if (val.descripcion?.trim()) {
      formData.append('descripcion', val.descripcion.trim());
    }

    if (this.archivoFotoSeleccionado()) {
      formData.append('imagenPerfil', this.archivoFotoSeleccionado()!);
    }

    this.usuariosService.crear(formData).subscribe({
      next: () => {
        this.enviandoAlta.set(false);
        this.cerrarModalAlta();
        this.servicioModal.abrir({
          titulo: '¡USUARIO CREADO!',
          mensaje: 'El nuevo usuario se registró exitosamente.',
          tipo: 'exito',
          onomatopeya: '¡SUGOI!'
        });
        this.offset.set(0);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.enviandoAlta.set(false);
        const msj = Array.isArray(err.error?.message)
          ? err.error.message.join(', ')
          : err.error?.message || 'Error al crear usuario.';

        this.servicioModal.abrir({
          titulo: err.status === 409 ? '¡DATOS REPETIDOS!' : '¡DATOS INVÁLIDOS!',
          mensaje: msj,
          tipo: 'error',
          onomatopeya: '¡NANI?!'
        });
      }
    });
  }

  esCampoInvalido(campoNombre: string): boolean {
    const c = this.formAlta.get(campoNombre);
    if (!c) return false;
    if (campoNombre === 'repetirPassword') {
      const noCoinciden = this.formAlta.hasError('noCoinciden') || c.hasError('noCoinciden');
      return (c.touched || c.dirty) && (c.invalid || noCoinciden);
    }
    return !!(c.invalid && (c.touched || c.dirty));
  }

  obtenerMensajeError(campoNombre: string): string {
    if (campoNombre === 'repetirPassword' && this.formAlta.hasError('noCoinciden')) {
      return 'Las contraseñas no coinciden.';
    }
    const c = this.formAlta.get(campoNombre);
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'Este campo es obligatorio.';
    if (c.errors['email']) return 'Formato de correo inválido.';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres.`;
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres.`;
    if (c.errors['pattern']) return 'Formato no permitido.';
    if (c.errors['fechaFutura']) return 'La fecha no puede ser futura.';
    return '';
  }
}