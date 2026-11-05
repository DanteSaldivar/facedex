import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalComponent } from './compartido/components/modal/modal.component';
import { NavbarComponent } from './compartido/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalComponent, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
