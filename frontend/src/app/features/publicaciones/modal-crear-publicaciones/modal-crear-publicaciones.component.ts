import { Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { ModalService } from '../../../compartido/services/modal.service';
import { manejarErrorHttp } from '../../utils/manejador-errores-http';
import { Publicacion } from '../../../core/models/publicacion.model';
import { InputComponent } from '../../../compartido/components/input/input.component';
import { ButtonComponent } from '../../../compartido/components/button/button.component';

@Component({
  imports: [InputComponent, ButtonComponent, ReactiveFormsModule],
  selector: 'app-modal-crear-publicacion',
  styleUrl: './modal-crear-publicaciones.component.scss',
  templateUrl: './modal-crear-publicaciones.component.html',
})
export class ModalCrearPublicacionComponent {

  private fb = inject(FormBuilder);
  private publicacionesService = inject(PublicacionesService);
  private servicioModal = inject(ModalService);

  creada = output<Publicacion>();
  cerrada = output<void>();

  readonly cargando = signal<boolean>(false);
  readonly vistaPreviaImagen = signal<string | null>(null);
  readonly archivoSeleccionado = signal<File | null>(null);
  readonly errorArchivo = signal<string | null>(null);

  formulario = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    mensaje: ['', [Validators.required, Validators.maxLength(500)]]
  });

  // Contador de caracteres en vivo para el mensaje (máx 500)
  readonly mensajeValor = signal<string>('');
  readonly caracteresRestantes = computed(() => 500 - this.mensajeValor().length);

  onMensajeInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.mensajeValor.set(target.value);
  }

  alSeleccionarImagen(evento: Event): void {
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
        this.errorArchivo.set('La imagen no puede pesar más de 5 MB.');
        return;
      }

      this.archivoSeleccionado.set(archivo);
      const lector = new FileReader();
      lector.onload = () => this.vistaPreviaImagen.set(lector.result as string);
      lector.readAsDataURL(archivo);
    }
  }

  quitarImagen(): void {
    this.archivoSeleccionado.set(null);
    this.vistaPreviaImagen.set(null);
    this.errorArchivo.set(null);
  }

  esCampoInvalido(nombreCampo: 'titulo' | 'mensaje'): boolean {
    const campo = this.formulario.get(nombreCampo);
    return !!(campo && campo.invalid && (campo.touched || campo.dirty));
  }

  obtenerMensajeError(nombreCampo: 'titulo' | 'mensaje'): string {
    const campo = this.formulario.get(nombreCampo);
    if (!campo || !campo.errors) return '';

    if (campo.errors['required']) return 'Este campo es obligatorio.';
    if (campo.errors['maxlength']) return `Máximo ${campo.errors['maxlength'].requiredLength} caracteres.`;
    return '';
  }

  alEnviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const datos = this.formulario.getRawValue();

    // FormData exacto con los nombres de campo requeridos por el backend: titulo, mensaje, imagen
    const formData = new FormData();
    formData.append('titulo', datos.titulo);
    formData.append('mensaje', datos.mensaje);

    if (this.archivoSeleccionado()) {
      formData.append('imagen', this.archivoSeleccionado()!);
    }

    this.publicacionesService.crear(formData).subscribe({
      next: (nuevaPublicacion) => {
        this.cargando.set(false);
        this.servicioModal.abrir({
          titulo: '¡NUEVA VIÑETA PUBLICADA!',
          mensaje: 'Tu publicación ha sido creada exitosamente.',
          tipo: 'exito',
          onomatopeya: '¡BAM!'
        });
        this.creada.emit(nuevaPublicacion);
      },
      error: (err) => {
        this.cargando.set(false);
        manejarErrorHttp(err, this.servicioModal);
      }
    });
  }

  cerrarModal(): void {
    this.cerrada.emit();
  }

}
