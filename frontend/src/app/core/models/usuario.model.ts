export type RolUsuario = 'usuario' | 'administrador';

export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion?: string;
  imagenPerfil?: string;
  perfil: RolUsuario;
  habilitado: boolean;
  createdAt?: string;
}

export interface RespuestaSesion {
  usuario: Usuario;
  expiraEn: number; // Epoc ms (ej: Date.now() + 900000)
}