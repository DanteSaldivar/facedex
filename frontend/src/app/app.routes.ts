import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard, publicoGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'cargando',
    pathMatch: 'full'
  },
  {
    path: 'cargando',
    loadComponent: () =>
      import('./features/cargando/cargando.component').then(
        m => m.CargandoComponent
      )
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
  //5. Ruta privada: detalle publicacion
  {
    path: 'publicaciones/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/publicaciones/detalle-publicaciones/detalle-publicaciones.component').then(
        m => m.DetallePublicacionesComponent
      )
  },

  // 6. Ruta privada: Mi Perfil 
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/perfil/perfil/perfil.component').then(
        m => m.PerfilComponent
      )
  },
  {
  path: 'dashboard/usuarios',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./features/dashboard/usuarios/usuarios.component').then(
      m => m.UsuariosComponent
    )
},
{
  path: 'dashboard/estadisticas',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./features/dashboard/estadisticas/estadisticas.component').then(
      m => m.EstadisticasComponent
    )
},
  // 7. Ruta de Error 404 perso
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
