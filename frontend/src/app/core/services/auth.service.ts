import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Usuario } from '../models/usuario.model';
import { Observable, tap } from 'rxjs';
import { AuthRespuesta, PeticionLogin } from '../models/auth.model';

@Service()
export class AuthService {

    private http = inject(HttpClient);
  private readonly URL_AUTH = `${environment.apiUrl}/auth`;

  // Signals reactivos para el estado de autenticación
  readonly usuarioActual = signal<Usuario | null>(this.obtenerUsuarioInicial());
  readonly estaLogueado = computed(() => !!this.usuarioActual() && !!this.obtenerToken());
  readonly esAdmin = computed(() => this.usuarioActual()?.perfil === 'administrador');

  /**
   * Registro con multipart/form-data
   * @param datosFormulario FormData que incluye la clave 'imagen' para el archivo
   */
  registro(datosFormulario: FormData): Observable<AuthRespuesta> {
    return this.http.post<AuthRespuesta>(`${this.URL_AUTH}/registro`, datosFormulario).pipe(
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }

  /**
   * Login enviando { identificador, password }
   */
  login(credenciales: PeticionLogin): Observable<AuthRespuesta> {
      return this.http.post<AuthRespuesta>(`${this.URL_AUTH}/login`, credenciales).pipe(
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }

  /**
   * Cierra sesión y limpia tokens
   */
  cerrarSesion(): void {
    localStorage.removeItem('token_mangakai');
    localStorage.removeItem('usuario_mangakai');
    this.usuarioActual.set(null);
  }

  /**
   * Obtiene el JWT almacenado
   */
  obtenerToken(): string | null {
    return localStorage.getItem('token_mangakai');
  }

  /**
   * Guarda el token y el perfil de usuario en localStorage y actualiza el signal
   */
  private guardarSesion(respuesta: AuthRespuesta): void {
    if (respuesta.token) {
      localStorage.setItem('token_mangakai', respuesta.token);
    }
    if (respuesta.usuario) {
      localStorage.setItem('usuario_mangakai', JSON.stringify(respuesta.usuario));
      this.usuarioActual.set(respuesta.usuario);
    }
  }

  /**
   * Recupera el usuario desde localStorage al iniciar la app
   */
  private obtenerUsuarioInicial(): Usuario | null {
    const usuarioGuardado = localStorage.getItem('usuario_mangakai');
    if (!usuarioGuardado) return null;
    try {
      return JSON.parse(usuarioGuardado) as Usuario;
    } catch {
      localStorage.removeItem('usuario_mangakai');
      return null;
    }
  }
}
