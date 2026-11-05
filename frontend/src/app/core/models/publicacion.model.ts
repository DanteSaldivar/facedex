import { Usuario } from './usuario.model';

export interface AutorPublicacion {
  _id: string;
  nombreUsuario: string;
  imagenPerfil?: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagenUrl?: string | null;
  autor: AutorPublicacion;
  likesCount: number;
  meGusta: boolean;
  comentariosCount: number;
  createdAt: string;
}

export interface ListadoPublicaciones {
  items: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}

export interface LikeRespuesta {
  likesCount: number;
  meGusta: boolean;
}

export interface Comentario {
  _id: string;
  mensaje: string;
  modificado: boolean;
  autor: AutorPublicacion;
  createdAt: string;
}

export interface ListadoComentarios {
  items: Comentario[];
  total: number;
  offset?: number;
  limit?: number;
}

export interface ParametrosListadoPublicaciones {
  orden?: 'fecha' | 'likes';
  offset?: number;
  limit?: number;
  usuarioId?: string;
}