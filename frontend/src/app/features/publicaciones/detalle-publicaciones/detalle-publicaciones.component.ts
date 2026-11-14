import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { Publicacion } from '../../../core/models/publicacion.model';
import { PublicacionComponent } from '../../../compartido/components/publicacion/publicacion.component';
import { SpinnerComponent } from '../../../compartido/components/spinner/spinner.component';
import { ButtonComponent } from '../../../compartido/components/button/button.component';
import { ListaComentariosComponent } from '../../comentarios/lista-comentarios/lista-comentarios.component';


@Component({
  selector: 'app-detalle-publicacion',
  standalone: true,
  imports: [PublicacionComponent, SpinnerComponent, ButtonComponent, ListaComentariosComponent],
  templateUrl: './detalle-publicaciones.component.html',
  styleUrl: './detalle-publicaciones.component.scss'
})
export class DetallePublicacionesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private publicacionesService = inject(PublicacionesService);

  readonly publicacion = signal<Publicacion | null>(null);
  readonly cargando = signal<boolean>(true);
  readonly noEncontrada = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.noEncontrada.set(true);
      this.cargando.set(false);
      return;
    }

    this.cargarPublicacion(id);
  }

  cargarPublicacion(id: string): void {
    this.cargando.set(true);
    this.noEncontrada.set(false);

    this.publicacionesService.obtenerPorId(id).subscribe({
      next: (pub) => {
        this.publicacion.set(pub);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 404) {
          this.noEncontrada.set(true);
        }
      }
    });
  }

  actualizarContadorComentarios(nuevoTotal: number): void {
    const pubActual = this.publicacion();
    if (pubActual) {
      this.publicacion.set({
        ...pubActual,
        comentariosCount: nuevoTotal
      });
    }
  }

  volverAlFeed(): void {
    this.router.navigate(['/publicaciones']);
  }
}