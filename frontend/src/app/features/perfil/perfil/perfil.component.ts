import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { ModalService } from '../../../compartido/services/modal.service';
import { Publicacion } from '../../../core/models/publicacion.model';
import { manejarErrorHttp } from '../../utils/manejador-errores-http';
import { AvatarComponent } from '../../../compartido/components/avatar/avatar.component';
import { PublicacionComponent } from '../../../compartido/components/publicacion/publicacion.component';
import { PublicacionesEsqueletoComponent } from '../../publicaciones/publicaciones-esqueleto/publicaciones-esqueleto.component';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { ListaComentariosComponent } from '../../comentarios/lista-comentarios/lista-comentarios.component';
import { SoloAdminDirective } from '../../../compartido/directivas/solo-admin.directive';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { fechaNoFuturaValidador } from '../../utils/validadores';
import { ButtonComponent } from '../../../compartido/components/button/button.component';
import { InputComponent } from '../../../compartido/components/input/input.component';
import { SpinnerComponent } from '../../../compartido/components/spinner/spinner.component';

@Component({
  imports: [AvatarComponent, PublicacionComponent, ReactiveFormsModule,PublicacionesEsqueletoComponent, UpperCasePipe, DatePipe, ListaComentariosComponent, SoloAdminDirective, ButtonComponent, InputComponent, SpinnerComponent],
  selector: 'app-perfil',
  styleUrl: './perfil.component.scss',
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {

  authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  private servicioModal = inject(ModalService);
  private fb = inject(FormBuilder);

  readonly usuario = this.authService.usuarioActual;
  readonly ultimasPublicaciones = signal<Publicacion[]>([]);
  readonly cargandoPublicaciones = signal<boolean>(true);

  readonly mostrarModalEditar = signal<boolean>(false);
  readonly guardandoPerfil = signal<boolean>(false);
  readonly vistaPreviaFoto = signal<string | null>(null);
  readonly archivoFotoSeleccionado = signal<File | null>(null);
  readonly errorArchivo = signal<string | null>(null);

  formEditar = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    fechaNacimiento: ['', [Validators.required, fechaNoFuturaValidador()]],
    descripcion: ['', [Validators.maxLength(200)]]
  });

  ngOnInit(): void {
    const usuario = this.usuario();
    if (usuario?._id) {
      this.cargarUltimasPublicaciones(usuario._id);
    }
  }

  cargarUltimasPublicaciones(usuarioId: string): void {
    this.cargandoPublicaciones.set(true);

    this.publicacionesService.listar({
      usuarioId: usuarioId,
      limit: 3,
      orden: 'fecha'
    }).subscribe({
      next: (res) => {
        this.ultimasPublicaciones.set(res.items);
        this.cargandoPublicaciones.set(false);
      },
      error: (err) => {
        this.cargandoPublicaciones.set(false);
        manejarErrorHttp(err, this.servicioModal);
      }
    });
  }

  alEliminarPublicacion(id: string): void {
    this.ultimasPublicaciones.update(lista => lista.filter(p => p._id !== id));
  }

  abrirModalEditar(): void {
    const u = this.authService.usuarioActual();
    if (!u) return;

    const fechaFormateada = u.fechaNacimiento ? u.fechaNacimiento.substring(0, 10) : '';

    this.formEditar.patchValue({
      nombre: u.nombre,
      apellido: u.apellido,
       correo: u.correo,
      fechaNacimiento: fechaFormateada,
      descripcion: u.descripcion || ''
    });

    this.vistaPreviaFoto.set(u.imagenPerfil || null);
    this.archivoFotoSeleccionado.set(null);
    this.errorArchivo.set(null);
    this.mostrarModalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar.set(false);
  }

  alSeleccionarFoto(evento: Event): void {
    this.errorArchivo.set(null);
    const input = evento.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const archivo = input.files[0];
      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
      const tamanoMaximo = 5 * 1024 * 1024;

      if (!tiposPermitidos.includes(archivo.type)) {
        this.errorArchivo.set('Solo se admiten formatos JPG, PNG o WEBP.');
        return;
      }

      if (archivo.size > tamanoMaximo) {
        this.errorArchivo.set('La imagen no puede superar los 5 MB.');
        return;
      }

      this.archivoFotoSeleccionado.set(archivo);
      const lector = new FileReader();
      lector.onload = () => this.vistaPreviaFoto.set(lector.result as string);
      lector.readAsDataURL(archivo);
    }
  }

  guardarCambios(): void {
    if (this.formEditar.invalid || this.guardandoPerfil()) {
      this.formEditar.markAllAsTouched();
      return;
    }

    this.guardandoPerfil.set(true);
    const val = this.formEditar.getRawValue();

    const formData = new FormData();
    formData.append('nombre', val.nombre.trim());
    formData.append('apellido', val.apellido.trim());
    formData.append('correo', val.correo.trim());
    formData.append('fechaNacimiento', val.fechaNacimiento);
    formData.append('descripcion', val.descripcion.trim());
    

    if (this.archivoFotoSeleccionado()) {
      formData.append('imagen', this.archivoFotoSeleccionado()!);
    }

    this.authService.actualizarPerfil(formData).subscribe({
      next: () => {
        this.guardandoPerfil.set(false);
        this.cerrarModalEditar();
        this.servicioModal.abrir({
          titulo: '¡PERFIL ACTUALIZADO!',
          mensaje: 'Tus datos en FaceDex se guardaron correctamente.',
          tipo: 'exito',
          onomatopeya: '¡SUGOI!'
        });
      },
      error: () => {
        this.guardandoPerfil.set(false);
      }
    });
  }

  esCampoInvalido(campo: string): boolean {
    const c = this.formEditar.get(campo);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  obtenerMensajeError(campo: string): string {
    const c = this.formEditar.get(campo);
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'Este campo es obligatorio.';
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres.`;
    if (c.errors['email']) return 'Ingresá un correo electrónico válido.';
    if (c.errors['fechaFutura']) return 'La fecha no puede ser futura.';
    return '';
  }

}
