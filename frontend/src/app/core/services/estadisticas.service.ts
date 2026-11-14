import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PublicacionesPorUsuarioRespuesta {
  desde: string;
  hasta: string;
  items: Array<{ usuarioId: string; nombreUsuario: string; cantidad: number }>;
  total: number;
}

export interface ComentariosPorDiaRespuesta {
  desde: string;
  hasta: string;
  items: Array<{ fecha: string; cantidad: number }>;
  total: number;
}

export interface ComentariosPorPublicacionRespuesta {
  desde: string;
  hasta: string;
  items: Array<{ publicacionId: string; titulo: string; autor: string; cantidad: number }>;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  publicacionesPorUsuario(desde: string, hasta: string): Observable<PublicacionesPorUsuarioRespuesta> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<PublicacionesPorUsuarioRespuesta>(`${this.apiUrl}/estadisticas/publicaciones-por-usuario`, { params });
  }

  comentariosPorDia(desde: string, hasta: string): Observable<ComentariosPorDiaRespuesta> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<ComentariosPorDiaRespuesta>(`${this.apiUrl}/estadisticas/comentarios-por-dia`, { params });
  }

  comentariosPorPublicacion(desde: string, hasta: string, limit = 10): Observable<ComentariosPorPublicacionRespuesta> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta).set('limit', limit.toString());
    return this.http.get<ComentariosPorPublicacionRespuesta>(`${this.apiUrl}/estadisticas/comentarios-por-publicacion`, { params });
  }
}