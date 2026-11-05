import { Routes } from '@angular/router';
import { authGuard, publicoGuard } from './core/guards/auth-guard';

 export const routes: Routes = [
  {
    path: '',
    redirectTo: 'publicaciones',
    pathMatch: 'full'
  },

  // 2. Ruta pública: Login
  {
    path: 'login',
    canActivate: [publicoGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        m => m.LoginComponent
      )
  },

  // 3. Ruta pública: Registro 
  {
    path: 'registro',
    canActivate: [publicoGuard],
    loadComponent: () =>
      import('./features/auth/registro/registro.component').then(
        m => m.RegistroComponent
      )
  },

  // 4. Ruta privada: 
  {
    path: 'publicaciones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/publicaciones/publicaciones/publicaciones.component').then(
        m => m.PublicacionesComponent
      )
  },

  // 5. Ruta privada: Mi Perfil 
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/perfil/perfil/perfil.component').then(
        m => m.PerfilComponent
      )
  },

  // 6. Ruta de Error 404 perso
  {
    path: '404',
    loadComponent: () =>
      import('./features/pagina 404/pagina-no-encontrada.component').then(
        m => m.PaginaNoEncontradaComponent
      )
  },

  // 7. capturar cualquier URL inexistente y redirigir a 404
  {
    path: '**',
    redirectTo: '404'
  }
];
