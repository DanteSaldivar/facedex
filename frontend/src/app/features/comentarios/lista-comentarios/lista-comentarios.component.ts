import { Component, OnInit, inject, signal, input, output } from '@angular/core';

import { ComentarioFormComponent } from '../comentario-form/comentario-form.component';
import { ComentarioItemComponent } from '../comentario-item/comentario-item.component';

import { Router } from '@angular/router';
import { ComentariosService } from '../../../core/services/comentarios.service';
import { ModalService } from '../../../compartido/services/modal.service';
import { Comentario } from '../../../core/models/publicacion.model';
import { ButtonComponent } from '../../../compartido/components/button/button.component';
import { SpinnerComponent } from '../../../compartido/components/spinner/spinner.component';

@Component({
  selector: 'app-lista-comentarios',
  standalone: true,
  imports: [ComentarioFormComponent, ComentarioItemComponent, ButtonComponent, SpinnerComponent],
  templateUrl: './lista-comentarios.component.html',
  styleUrl: './lista-comentarios.component.scss'
})
export class ListaComentariosComponent implements OnInit {

  publicacionId = input.required<string>();
  modoLectura = input<boolean>(false);
  limiteInicial = input(10);

  cambioTotalComentarios = output<number>();

  private comentariosService = inject(ComentariosService);
  private servicioModal = inject(ModalService);
  private router = inject(Router);

  readonly comentarios = signal<Comentario[]>([]);
  readonly total = signal<number>(0);
  readonly cargando = signal<boolean>(true);
  readonly cargandoMas = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarComentariosIniciales();
  }

  cargarComentariosIniciales(): void {
    this.cargando.set(true);
    const limit = this.modoLectura() ? 3 : this.limiteInicial();

    this.comentariosService.listar(this.publicacionId(), 0, limit).subscribe({
      next: (res) => {
        this.comentarios.set(res.items);
        this.total.set(res.total);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 404) {
          this.servicioModal.abrir({
            titulo: '¡VIÑETA ELIMINADA!',
            mensaje: 'Esta publicación ya no existe.',
            tipo: 'error',
            onomatopeya: '¡QUEEE?!'
          });
          this.router.navigate(['/publicaciones']);
        }
      }
    });
  }

  cargarMas(): void {
    if (this.cargandoMas() || this.comentarios().length >= this.total()) return;

    this.cargandoMas.set(true);
    const offset = this.comentarios().length;

    this.comentariosService.listar(this.publicacionId(), offset, this.limiteInicial()).subscribe({
      next: (res) => {
        // Prevenir duplicados deduplicando por _id
        const nuevos = res.items.filter(item => !this.comentarios().some(c => c._id === item._id));
        this.comentarios.update(prev => [...prev, ...nuevos]);
        this.total.set(res.total);
        this.cargandoMas.set(false);
      },
      error: () => {
        this.cargandoMas.set(false);
      }
    });
  }

  alCrearComentario(nuevo: Comentario): void {
    this.comentarios.update(prev => [nuevo, ...prev]);
    this.total.update(n => n + 1);
    this.cambioTotalComentarios.emit(this.total());
  }

  alEditarComentario(actualizado: Comentario): void {
    this.comentarios.update(prev =>
      prev.map(c => c._id === actualizado._id ? actualizado : c)
    );
  }
}