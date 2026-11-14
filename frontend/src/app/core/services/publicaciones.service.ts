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
  private apiUrl = environment.apiUrl;

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

    return this.http.get<ListadoPublicaciones>(`${this.apiUrl}/publicaciones`, { params: httpParams });
  }

  
  /**
   * GET /publicaciones?id=
   */ 
  obtenerPorId(id: string): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.apiUrl}/publicaciones/${id}`);
  }

  /**
   * POST /publicaciones (FormData con titulo, mensaje e imagen opcional)
   */
  crear(formData: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.apiUrl}/publicaciones`, formData);
  }

  /**
   * DELETE /publicaciones/:id
   */
  eliminar(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/publicaciones/${id}`);
  }

  /**
   * POST /publicaciones/:id/like
   */
  darLike(id: string): Observable<LikeRespuesta> {
    return this.http.post<LikeRespuesta>(`${this.apiUrl}/publicaciones/${id}/like`, {});
  }

  /**
   * DELETE /publicaciones/:id/like
   */
  quitarLike(id: string): Observable<LikeRespuesta> {
    return this.http.delete<LikeRespuesta>(`${this.apiUrl}/publicaciones/${id}/like`);
  }
}