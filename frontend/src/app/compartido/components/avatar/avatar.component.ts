import { Component, computed, input } from '@angular/core';
import { InicialesPipe } from '../../pipes/iniciales.pipe';

@Component({
  imports: [InicialesPipe],
  selector: 'app-avatar',
  styleUrl: './avatar.component.scss',
  templateUrl: './avatar.component.html',
})
export class AvatarComponent {

  imagenUrl = input<string | undefined>();
  nombre = input<string>('Usuario');
  apellido = input<string>('');
  tamano = input<number>(44);

  iniciales = computed(() => {
    const nom = this.nombre().trim();
    if (!nom) return 'U';
    const partes = nom.split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nom.substring(0, 2).toUpperCase();
  });

}
