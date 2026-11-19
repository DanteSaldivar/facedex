import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RespuestaActualizarPerfil, RespuestaSesion, Usuario } from '../models/usuario.model';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { SesionService } from './sesion.service';
import { reiniciarFlagModal401 } from '../interceptors/auth.interceptor';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private injector = inject(Injector);

  readonly usuarioActual = signal<Usuario | null>(null);
  readonly expiraEn = signal<number | null>(null);
  readonly cargandoInicial = signal<boolean>(true);

  constructor() {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      localStorage.removeItem('token');
    }
  }

  estaLogueado(): boolean {
    return !!this.usuarioActual();
  }

  establecerSesion(res: RespuestaSesion): void {
    reiniciarFlagModal401();
    this.usuarioActual.set(res.usuario);
    this.expiraEn.set(res.expiraEn);
    this.injector.get(SesionService).iniciarControlSesion(res.expiraEn);
  }

  limpiarEstadoMemoria(): void {
    this.usuarioActual.set(null);
    this.expiraEn.set(null);
  }

  actualizarPerfil(formData: FormData): Observable<Usuario> {
  return this.http.patch<RespuestaActualizarPerfil>(
    `${this.apiUrl}/usuarios/perfil`,
    formData
  ).pipe(
    tap((respuesta) => {
      const usuarioActual = this.usuarioActual();

      if (usuarioActual) {
        this.usuarioActual.set({
          ...usuarioActual,
          ...respuesta.usuario
        });
      }
    }),
    map(respuesta => respuesta.usuario)
  );
}

  login(credenciales: { identificador: string; password: string }): Observable<RespuestaSesion> {
    return this.http.post<RespuestaSesion>(`${this.apiUrl}/auth/login`, credenciales).pipe(
      tap(res => this.establecerSesion(res))
    );
  }

  registro(datosRegistro: FormData | any): Observable<RespuestaSesion> {
    return this.http.post<RespuestaSesion>(`${this.apiUrl}/auth/registro`, datosRegistro).pipe(
      tap(res => this.establecerSesion(res))
    );
  }

  autorizar(): Observable<RespuestaSesion> {
    return this.http.post<RespuestaSesion>(
      `${this.apiUrl}/auth/autorizar`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(res => this.establecerSesion(res))
    );
  }

  refrescar(): Observable<RespuestaSesion> {
    return this.http.post<RespuestaSesion>(`${this.apiUrl}/auth/refrescar`, {}).pipe(
      tap(res => this.establecerSesion(res))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => this.limpiarEstadoMemoria()),
      catchError(() => {
        this.limpiarEstadoMemoria();
        return of(null);
      })
    );
  }
}