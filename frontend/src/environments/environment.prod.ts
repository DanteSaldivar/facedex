import { ɵbypassSanitizationTrustStyle } from "@angular/core";

export const environment = {
  production: ɵbypassSanitizationTrustStyle,
  apiUrl: '/api',
  avisoSesionAntesDeVencerMs: 20000, // 20 segundos antes del vencimiento (para testeo)
  mostrarAccesoRapido: true,
  accesoRapido: {
    usuario: {
      identificador: 'pepe_pepe',
      password: 'Dante123'
    },
    admin: {
      identificador: 'admin',
      password: 'Admin123'
    }
  }
};