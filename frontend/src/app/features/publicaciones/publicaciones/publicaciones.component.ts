import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../compartido/services/modal.service';
import { Publicacion } from '../../../core/models/publicacion.model';
import { manejarErrorHttp } from '../../utils/manejador-errores-http';
import { EsqueletoPublicacionComponent } from '../../../compartido/components/esqueleto-publicacion/esqueleto-publicacion.component';
import { PublicacionComponent } from '../../../compartido/components/publicacion/publicacion.component';
import { ButtonComponent } from '../../../compartido/components/button/button.component';
import { ModalCrearPublicacionComponent } from '../modal-crear-publicaciones/modal-crear-publicaciones.component';
import { SpinnerComponent } from '../../../compartido/components/spinner/spinner.component';


@Component({
  imports: [EsqueletoPublicacionComponent, PublicacionComponent, ButtonComponent, ModalCrearPublicacionComponent, SpinnerComponent],
  selector: 'app-publicaciones',
  styleUrl: './publicaciones.component.scss',
  templateUrl: './publicaciones.component.html',
})
export class PublicacionesComponent implements OnInit{

  private publicacionesService = inject(PublicacionesService);
  authService = inject(AuthService);
  private servicioModal = inject(ModalService);

  readonly limit = 10;

  // Signals de estado del feed
  readonly publicaciones = signal<Publicacion[]>([]);
  readonly totalItems = signal<number>(0);
  readonly cargando = signal<boolean>(true);
  readonly ordenActual = signal<'fecha' | 'likes'>('fecha');
  readonly paginaActual = signal<number>(1);
  readonly mostrarModalCrear = signal<boolean>(false);

  // Cálculos reactivos de la paginación
  readonly totalPaginas = computed(() => {
    const total = this.totalItems();
    return total > 0 ? Math.ceil(total / this.limit) : 1;
  });

  readonly offset = computed(() => (this.paginaActual() - 1) * this.limit);

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.cargando.set(true);

    this.publicacionesService.listar({
      orden: this.ordenActual(),
      offset: this.offset(),
      limit: this.limit
    }).subscribe({
      next: (res) => {
        this.publicaciones.set(res.items);
        this.totalItems.set(res.total);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        manejarErrorHttp(err, this.servicioModal);
      }
    });
  }

  alCambiarOrden(nuevoOrden: 'fecha' | 'likes'): void {
    if (this.ordenActual() === nuevoOrden) return;
    this.ordenActual.set(nuevoOrden);
    this.paginaActual.set(1); // Volver a la página 1 al cambiar el orden[cite: 3]
    this.cargarPublicaciones();
  }

  irAPagina(nuevaPagina: number): void {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas() || nuevaPagina === this.paginaActual()) return;
    this.paginaActual.set(nuevaPagina);
    this.cargarPublicaciones();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  alEliminarPublicacion(id: string): void {
    // Quitar del signal inmediatamente o recargar si la página queda vacía
    this.publicaciones.update(lista => lista.filter(p => p._id !== id));
    this.totalItems.update(total => Math.max(0, total - 1));

    if (this.publicaciones().length === 0 && this.paginaActual() > 1) {
      this.paginaActual.update(p => p - 1);
      this.cargarPublicaciones();
    }
  }

  alCrearPublicacionExito(): void {
    this.mostrarModalCrear.set(false);
    this.paginaActual.set(1); // Volver a la página 1 al publicar
    this.cargarPublicaciones();
  }

}
