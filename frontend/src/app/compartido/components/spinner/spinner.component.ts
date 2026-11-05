import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-spinner',
  styleUrl: './spinner.component.scss',
  templateUrl: './spinner.component.html',
})
export class SpinnerComponent {

  texto = input<string>('¡Cargandoo!');

}
