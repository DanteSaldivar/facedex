import { Usuario } from './usuario.model';

export interface Comentario {
  _id: string;
  mensaje: string;
  modificado: boolean;
  autor: Pick<Usuario, '_id' | 'nombreUsuario' | 'imagenPerfil'>;
  createdAt: string;
}

export interface ListadoComentarios {
  items: Comentario[];
  total: number;
  offset: number;
  limit: number;
}