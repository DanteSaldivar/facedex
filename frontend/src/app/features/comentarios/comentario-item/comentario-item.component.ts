import { Component, Input, Output, EventEmitter, inject, signal, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Comentario } from '../../../core/models/publicacion.model';
import { AuthService } from '../../../core/services/auth.service';
import { ComentariosService } from '../../../core/services/comentarios.service';
import { AvatarComponent } from '../../../compartido/components/avatar/avatar.component';
import { ButtonComponent } from '../../../compartido/components/button/button.component';
import { TiempoTranscurridoPipe } from '../../../compartido/pipes/tiempo-transcurrido.pipe';

@Component({
  selector: 'app-comentario-item',
  standalone: true,
  imports: [ReactiveFormsModule, AvatarComponent, ButtonComponent, TiempoTranscurridoPipe],
  templateUrl: './comentario-item.component.html',
  styleUrl: './comentario-item.component.scss'
})
export class ComentarioItemComponent {

  comentario = input.required<Comentario>();
  publicacionId = input<string>();
  modoLectura = input<boolean>(false);
  comentarioEditado = output<Comentario>();

  private authService = inject(AuthService);
  private comentariosService = inject(ComentariosService);
  private fb = inject(FormBuilder);

  readonly modoEdicion = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);

  formEdicion = this.fb.nonNullable.group({
    mensaje: ['', [Validators.required, Validators.maxLength(300), Validators.pattern(/^(?!\s*$).+/)]]
  });

  get esAutor(): boolean {
    const u = this.authService.usuarioActual();
    return !!u && u._id === this.comentario().autor._id;
  }

  activarEdicion(): void {
    this.formEdicion.patchValue({ mensaje: this.comentario().mensaje });
    this.modoEdicion.set(true);
  }

  cancelarEdicion(): void {
    this.modoEdicion.set(false);
  }

  guardarEdicion(): void {
    if (this.formEdicion.invalid || this.guardando()) return;

    const nuevoMensaje = this.formEdicion.controls.mensaje.value.trim();
    this.guardando.set(true);

    this.comentariosService.editar(this.publicacionId()!, this.comentario()._id, nuevoMensaje).subscribe({
      next: (actualizado) => {
        this.guardando.set(false);
        this.modoEdicion.set(false);
        this.comentarioEditado.emit(actualizado);
      },
      error: () => {
        this.guardando.set(false);
      }
    });
  }
}