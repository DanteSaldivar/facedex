import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comentario, ListadoComentarios } from '../models/comentario.model';

@Injectable({
  providedIn: 'root'
})
export class ComentariosService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  listar(publicacionId: string, offset = 0, limit = 10): Observable<ListadoComentarios> {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http.get<ListadoComentarios>(`${this.apiUrl}/publicaciones/${publicacionId}/comentarios`, { params });
  }

  crear(publicacionId: string, mensaje: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.apiUrl}/publicaciones/${publicacionId}/comentarios`, { mensaje });
  }

  editar(publicacionId: string, comentarioId: string, mensaje: string): Observable<Comentario> {
    return this.http.put<Comentario>(`${this.apiUrl}/publicaciones/${publicacionId}/comentarios/${comentarioId}`, { mensaje });
  }
}