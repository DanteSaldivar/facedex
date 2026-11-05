import { Component, inject, input, signal } from '@angular/core';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { Comentario } from '../../../core/models/publicacion.model';
import { AvatarComponent } from '../../../compartido/components/avatar/avatar.component';
import { TiempoTranscurridoPipe } from '../../../compartido/pipes/tiempo-transcurrido.pipe';

@Component({
  imports: [AvatarComponent, TiempoTranscurridoPipe],
  selector: 'app-bloque-comentarios',
  styleUrl: './bloque-comentarios.component.scss',
  templateUrl: './bloque-comentarios.component.html',
})
export class BloqueComentariosComponent {

  private publicacionesService = inject(PublicacionesService);


  publicacionId = input.required<string>();
  totalComentariosInicial = input<number>(0);

  readonly desplegado = signal<boolean>(false);
  readonly cargando = signal<boolean>(false);
  readonly comentarios = signal<Comentario[]>([]);
  readonly errorCarga = signal<string | null>(null);

  toggleDesplegar(): void {
    const estadoActual = this.desplegado();
    this.desplegado.set(!estadoActual);

    // Cargar comentarios en la primera apertura si aún no se trajeron
    if (!estadoActual && this.comentarios().length === 0) {
      this.cargarComentarios();
    }
  }

  cargarComentarios(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.publicacionesService.obtenerComentarios(this.publicacionId(), 0, 3).subscribe({
      next: (res) => {
        this.comentarios.set(res.items);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.errorCarga.set('No se pudieron cargar los comentarios de esta viñeta.');
      }
    });
  }

}
