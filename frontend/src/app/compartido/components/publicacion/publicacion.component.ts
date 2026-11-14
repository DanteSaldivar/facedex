import { Component, computed, EventEmitter, inject, input, output, signal } from '@angular/core';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { ModalService } from '../../services/modal.service';
import { Publicacion } from '../../../core/models/publicacion.model';
import { Usuario } from '../../../core/models/usuario.model';
import { manejarErrorHttp } from '../../../features/utils/manejador-errores-http';
import { AvatarComponent } from '../avatar/avatar.component';
import { TiempoTranscurridoPipe } from '../../pipes/tiempo-transcurrido.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { RecortarTexto } from '../../pipes/recortar-texto.pipe';

@Component({
  imports: [AvatarComponent, TiempoTranscurridoPipe, RecortarTexto],
  selector: 'app-publicacion',
  styleUrl: './publicacion.component.scss',
  templateUrl: './publicacion.component.html',
})
export class PublicacionComponent {

  private publicacionesService = inject(PublicacionesService);
  private authService = inject(AuthService);
  private servicioModal = inject(ModalService);
  private router = inject(Router);

  publicacion = input.required<Publicacion>();
  usuarioActual = input<Usuario | null>(null);
  modo = input<'feed' | 'detalle'>('feed');


  eliminada = output<string>();

  readonly publicacionLocal = signal<Publicacion | null>(null);
  readonly procesandoLike = signal<boolean>(false);
  readonly procesandoEliminacion = signal<boolean>(false);


  constructor() {
    // Sincronizamos la entrada inicial con el estado local
    const effectRef = () => {
      this.publicacionLocal.set(this.publicacion());
    };
    // Sincronizar inmediatamente al instanciar
    setTimeout(() => effectRef(), 0);
  }

  // Getter helper para tener siempre el estado actualizado de la publicación
  get obtenerPublicacion(): Publicacion {
    return this.publicacionLocal() || this.publicacion();
  }

  get esAutor(): boolean {
    const usuario = this.authService.usuarioActual();
    return !!usuario && usuario._id === this.publicacion().autor._id;
  }

  get esAdmin(): boolean {
    const usuario = this.authService.usuarioActual();
    return usuario?.perfil === 'administrador';
  }

  get puedeEliminar(): boolean {
    return this.esAutor || this.esAdmin;
  }

  irAlDetalle(): void {
    if (this.modo() === 'feed') {
      this.router.navigate(['/publicaciones', this.publicacion()._id]);
    }
  }

  alAlternarLike(): void {
    const pubActual = this.obtenerPublicacion;
    if (!pubActual || this.procesandoLike()) return;

    this.procesandoLike.set(true);

    const estadoPrevio = { ...pubActual };
    const nuevoMeGusta = !pubActual.meGusta;
    const nuevoCount = nuevoMeGusta
      ? pubActual.likesCount + 1
      : Math.max(0, pubActual.likesCount - 1);

    this.publicacionLocal.set({
      ...pubActual,
      meGusta: nuevoMeGusta,
      likesCount: nuevoCount
    });

    const peticion$ = nuevoMeGusta
      ? this.publicacionesService.darLike(pubActual._id)
      : this.publicacionesService.quitarLike(pubActual._id);

    peticion$.subscribe({
      next: (res) => {

        this.publicacionLocal.update(actual => {
          if (!actual) return null;
          return {
            ...actual,
            likesCount: res.likesCount,
            meGusta: res.meGusta
          };
        });
        this.procesandoLike.set(false);
      },
      error: (err) => {
        this.publicacionLocal.set(estadoPrevio);
        this.procesandoLike.set(false);

        if (err.status === 404) {
          this.servicioModal.abrir({
            titulo: '¡PUBLICACIÓN NO ENCONTRADA!',
            mensaje: 'Esta publicación ya fue eliminada por su autor.',
            tipo: 'error',
            onomatopeya: '¡NANI?!'
          });
          this.eliminada.emit(pubActual._id);
        } else {
          manejarErrorHttp(err, this.servicioModal);
        }
      }
    });
  }

  /**
   * Confirmación y borrado de la publicación
   */
  async alConfirmarEliminar(): Promise<void> {
    const pubActual = this.obtenerPublicacion;
    if (!pubActual || this.procesandoEliminacion()) return;

    const confirmado = await this.servicioModal.confirmar({
      titulo: '¿BORRAR VIÑETA?',
      mensaje: `¿Estás seguro de eliminar la publicación "${pubActual.titulo}"?`,
      tipo: 'confirmacion',
      onomatopeya: '¡WHAAT?!',
      textoConfirmar: '¡SÍ, ELIMINAR!',
      textoCancelar: 'CANCELAR'
    });

    if (!confirmado) return;

    this.procesandoEliminacion.set(true);

    this.publicacionesService.eliminar(pubActual._id).subscribe({
      next: () => {
        this.servicioModal.abrir({
          titulo: '¡VIÑETA ELIMINADA!',
          mensaje: 'La publicación ha sido removida.',
          tipo: 'exito',
          onomatopeya: '¡BAM!'
        });
        this.eliminada.emit(pubActual._id);
      },
      error: (err) => {
        this.procesandoEliminacion.set(false);
        if (err.status === 404) {
          this.eliminada.emit(pubActual._id);
        }
        manejarErrorHttp(err, this.servicioModal);
      }
    });
  }
}
