import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../core/models/usuario.model';

export interface ListadoUsuariosRespuesta {
  items: Usuario[];
  total: number;
  offset: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
    
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  listar(offset = 0, limit = 10, buscar = ''): Observable<ListadoUsuariosRespuesta> {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    if (buscar.trim()) {
      params = params.set('buscar', buscar.trim());
    }

    return this.http.get<ListadoUsuariosRespuesta>(`${this.apiUrl}/usuarios`, { params });
  }

  crear(formData: FormData): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, formData);
  }

  deshabilitar(id: string): Observable<{ message: string; usuario: Usuario }> {
    return this.http.delete<{ message: string; usuario: Usuario }>(`${this.apiUrl}/usuarios/${id}`);
  }

  habilitar(id: string): Observable<{ message: string; usuario: Usuario }> {
    return this.http.post<{ message: string; usuario: Usuario }>(`${this.apiUrl}/usuarios/${id}/habilitar`, {});
  }
}