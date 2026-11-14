import { Component, inject, signal, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComentariosService } from '../../../core/services/comentarios.service';
import { ButtonComponent } from '../../../compartido/components/button/button.component';
import { Comentario } from '../../../core/models/publicacion.model';


@Component({
  selector: 'app-comentario-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './comentario-form.component.html',
  styleUrl: './comentario-form.component.scss'
})
export class ComentarioFormComponent {

  publicacionId = input.required<string>();
  comentarioCreado = output<Comentario>();

  private fb = inject(FormBuilder);
  private comentariosService = inject(ComentariosService);

  readonly enviando = signal<boolean>(false);

  form = this.fb.nonNullable.group({
    mensaje: ['', [
      Validators.required,
      Validators.maxLength(300),
      Validators.pattern(/^(?!\s*$).+/) // Previene espacios vacíos solos
    ]]
  });

  get contadorCaracteres(): number {
    return this.form.controls.mensaje.value.length;
  }

  get esInvalido(): boolean {
    const ctrl = this.form.controls.mensaje;
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  enviarComentario(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    const mensajeLimpio = this.form.controls.mensaje.value.trim();
    this.enviando.set(true);

    this.comentariosService.crear(this.publicacionId(), mensajeLimpio).subscribe({
      next: (nuevoComentario) => {
        this.enviando.set(false);
        this.form.reset();
        this.comentarioCreado.emit(nuevoComentario);
      },
      error: () => {
        this.enviando.set(false);
      }
    });
  }
}