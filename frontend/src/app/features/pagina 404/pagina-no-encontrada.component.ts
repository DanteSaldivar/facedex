import { Component } from '@angular/core';
import { ButtonComponent } from '../../compartido/components/button/button.component';
import { RouterLink } from '@angular/router';

@Component({
  imports: [ButtonComponent, RouterLink],
  selector: 'app-pagina-no-encontrada',
  styleUrl: './pagina-no-encontrada.component.scss',
  templateUrl: './pagina-no-encontrada.component.html',
})
export class PaginaNoEncontradaComponent {}
