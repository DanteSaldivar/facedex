import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  imports: [NgClass],
  selector: 'app-button',
  styleUrl: './button.component.scss',
  templateUrl: './button.component.html',
})
export class ButtonComponent {

  variante = input<'primary' | 'secondary' | 'danger' | 'icon'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  block = input(false);

  onClick = output<MouseEvent>();
}
