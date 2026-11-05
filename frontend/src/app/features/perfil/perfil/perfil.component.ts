import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { ModalService } from '../../../compartido/services/modal.service';
import { Publicacion } from '../../../core/models/publicacion.model';
import { manejarErrorHttp } from '../../utils/manejador-errores-http';
import { AvatarComponent } from '../../../compartido/components/avatar/avatar.component';
import { PublicacionComponent } from '../../../compartido/components/publicacion/publicacion.component';
import { BloqueComentariosComponent } from '../bloque-comentarios/bloque-comentarios.component';
import { PublicacionesEsqueletoComponent } from '../../publicaciones/publicaciones-esqueleto/publicaciones-esqueleto.component';
import { DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  imports: [AvatarComponent, PublicacionComponent, BloqueComentariosComponent, PublicacionesEsqueletoComponent, UpperCasePipe, DatePipe],
  selector: 'app-perfil',
  styleUrl: './perfil.component.scss',
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {

  authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  private servicioModal = inject(ModalService);

  readonly ultimasPublicaciones = signal<Publicacion[]>([]);
  readonly cargandoPublicaciones = signal<boolean>(true);

  get usuario() {
    return this.authService.usuarioActual();
  }

  ngOnInit(): void {
    if (this.usuario?._id) {
      this.cargarUltimasPublicaciones(this.usuario._id);
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

}
