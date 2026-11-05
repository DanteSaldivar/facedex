import { Usuario } from './usuario.model';

export interface AuthRespuesta {
  token: string;
  usuario: Usuario;
}

export interface PeticionLogin {
  identificador: string; // "usuario o correo"
  password: string;
}

// Estructura de error del backend NestJS
export interface ErrorRespuestaBackend {
  statusCode: number;
  message: string | string[];
  error?: string;
}