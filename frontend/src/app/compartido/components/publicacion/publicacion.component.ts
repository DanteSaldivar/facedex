import { Component, computed, EventEmitter, inject, input, output, signal } from '@angular/core';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { ModalService } from '../../services/modal.service';
import { Publicacion } from '../../../core/models/publicacion.model';
import { Usuario } from '../../../core/models/usuario.model';
import { manejarErrorHttp } from '../../../features/utils/manejador-errores-http';
import { AvatarComponent } from '../avatar/avatar.component';
import { TiempoTranscurridoPipe } from '../../pipes/tiempo-transcurrido.pipe';

@Component({
  imports: [AvatarComponent, TiempoTranscurridoPipe],
  selector: 'app-publicacion',
  styleUrl: './publicacion.component.scss',
  templateUrl: './publicacion.component.html',
})
export class PublicacionComponent {

  private publicacionesService = inject(PublicacionesService);
  private servicioModal = inject(ModalService);

  publicacion = input.required<Publicacion>();
  usuarioActual = input<Usuario | null>(null);
  esAdmin = input(false);

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
  get pub(): Publicacion {
    return this.publicacionLocal() || this.publicacion();
  }

  // FIX BUG 2: Verificación estricta de propiedad/rol sin mutar autor
readonly esPropiaOAdmin = computed(() => {
    const p = this.publicacionLocal() || this.publicacion();
    const user = this.usuarioActual();
    const adminFlag = this.esAdmin();

    if (!p || !user || !p.autor || !user._id) {
      return false;
    }

    // Extraer el ID del autor sin importar si viene como String u Objeto
    const idAutor = typeof p.autor === 'string' ? p.autor : p.autor._id;
    const miId = user._id;

    // Normalización y comparación estricta de cadenas de texto
    const esAutor = Boolean(idAutor && miId && String(idAutor).trim() === String(miId).trim());
    const esAdministrador = adminFlag || user.perfil === 'administrador';

    return esAutor || esAdministrador;
  });

  
  alAlternarLike(): void {
    const pubActual = this.pub;
    if (!pubActual || this.procesandoLike()) return;

    this.procesandoLike.set(true);

    const estadoPrevio = { ...pubActual };
    const nuevoMeGusta = !pubActual.meGusta;
    const nuevoCount = nuevoMeGusta
      ? pubActual.likesCount + 1
      : Math.max(0, pubActual.likesCount - 1);

    // 1. Actualización en tiempo real inmediata (UI Optimista)
    this.publicacionLocal.set({
      ...pubActual,
      meGusta: nuevoMeGusta,
      likesCount: nuevoCount
    });

    // 2. Ejecutar petición correspondiente según la consigna
    const peticion$ = nuevoMeGusta
      ? this.publicacionesService.darLike(pubActual._id)
      : this.publicacionesService.quitarLike(pubActual._id);

    peticion$.subscribe({
      next: (res) => {
        // Aseguramos mantener la estructura del autor intacta para no romper 'esPropiaOAdmin'
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
        // Rollback exacto solo si hay un error real de HTTP
        this.publicacionLocal.set(estadoPrevio);
        this.procesandoLike.set(false);

        // Si realmente la publicación ya no existe en el backend (HTTP 404 real)
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
    const pubActual = this.pub;
    if (!pubActual || this.procesandoEliminacion()) return;

    const confirmado = await this.servicioModal.confirmar({
      titulo: '¿BORRAR VIÑETA?',
      mensaje: `¿Estás seguro de eliminar la publicación "${pubActual.titulo}"?`,
      tipo: 'confirmacion',
      onomatopeya: '¡NANI?!',
      textoConfirmar: '¡SÍ, ELIMINAR!',
      textoCancelar: 'CANCELAR'
    });

    if (!confirmado) return;

    this.procesandoEliminacion.set(true);

    this.publicacionesService.eliminar(pubActual._id).subscribe({
      next: () => {
        this.servicioModal.abrir({
          titulo: '¡VIÑETA ELIMINADA!',
          mensaje: 'La publicación ha sido removida del manga.',
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
