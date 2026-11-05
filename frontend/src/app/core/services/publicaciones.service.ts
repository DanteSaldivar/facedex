import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Publicacion,
  ListadoPublicaciones,
  LikeRespuesta,
  ListadoComentarios,
  ParametrosListadoPublicaciones
} from '../models/publicacion.model';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private http = inject(HttpClient);
  private readonly URL_PUBLICACIONES = `${environment.apiUrl}/publicaciones`;

  /**
   * GET /publicaciones?orden=fecha|likes&offset=0&limit=10&usuarioId=
   */
  listar(params: ParametrosListadoPublicaciones): Observable<ListadoPublicaciones> {
    let httpParams = new HttpParams();

    if (params.orden) {
      httpParams = httpParams.set('orden', params.orden);
    }
    if (params.offset !== undefined) {
      httpParams = httpParams.set('offset', params.offset.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.usuarioId) {
      httpParams = httpParams.set('usuarioId', params.usuarioId);
    }

    return this.http.get<ListadoPublicaciones>(this.URL_PUBLICACIONES, { params: httpParams });
  }

  /**
   * POST /publicaciones (FormData con titulo, mensaje e imagen opcional)
   */
  crear(datosFormulario: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.URL_PUBLICACIONES, datosFormulario);
  }

  /**
   * DELETE /publicaciones/:id
   */
  eliminar(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.URL_PUBLICACIONES}/${id}`);
  }

  /**
   * POST /publicaciones/:id/like
   */
  darLike(id: string): Observable<LikeRespuesta> {
    return this.http.post<LikeRespuesta>(`${this.URL_PUBLICACIONES}/${id}/like`, {});
  }

  /**
   * DELETE /publicaciones/:id/like
   */
  quitarLike(id: string): Observable<LikeRespuesta> {
    return this.http.delete<LikeRespuesta>(`${this.URL_PUBLICACIONES}/${id}/like`);
  }

  /**
   * GET /publicaciones/:id/comentarios?offset=0&limit=3
   */
  obtenerComentarios(id: string, offset = 0, limit = 3): Observable<ListadoComentarios> {
    let httpParams = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http.get<ListadoComentarios>(`${this.URL_PUBLICACIONES}/${id}/comentarios`, { params: httpParams });
  }
}