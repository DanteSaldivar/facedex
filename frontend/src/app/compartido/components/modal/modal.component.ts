import { AfterViewChecked, Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  imports: [ButtonComponent],
  selector: 'app-modal',
  styleUrl: './modal.component.scss',
  templateUrl: './modal.component.html',
})
export class ModalComponent implements AfterViewChecked {
  servicioModal = inject(ModalService);
  @ViewChild('modalContainer') contenedorModal!: ElementRef<HTMLDivElement>;

  private enfocadoInicial = false;

  get modal() {
    return this.servicioModal.configuracion();
  }

  // Cierre accesible al presionar Escape
  @HostListener('document:keydown.escape', ['$event'])
  alPresionarEscape(evento: Event): void {
    const eventoTecla = evento as KeyboardEvent;

    if (this.servicioModal.estaAbierto()) {
      eventoTecla.preventDefault();
      this.cancelar();
    }
  }

  // Atrapado del Foco (Focus Trap)
  @HostListener('document:keydown.tab', ['$event'])
  alPresionarTab(evento: Event): void {
    const eventoTecla = evento as KeyboardEvent;

    if (!this.servicioModal.estaAbierto() || !this.contenedorModal) return;

    const elementosFocoseables = this.contenedorModal.nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (elementosFocoseables.length === 0) return;

    const primerElemento = elementosFocoseables[0];
    const ultimoElemento = elementosFocoseables[elementosFocoseables.length - 1];

    if (eventoTecla.shiftKey && document.activeElement === primerElemento) {
      eventoTecla.preventDefault();
      ultimoElemento.focus();
    } else if (!eventoTecla.shiftKey && document.activeElement === ultimoElemento) {
      eventoTecla.preventDefault();
      primerElemento.focus();
    }
  }

  ngAfterViewChecked(): void {
    if (this.servicioModal.estaAbierto() && !this.enfocadoInicial && this.contenedorModal) {
      const primerBoton = this.contenedorModal.nativeElement.querySelector<HTMLElement>('button');
      if (primerBoton) {
        primerBoton.focus();
        this.enfocadoInicial = true;
      }
    } else if (!this.servicioModal.estaAbierto()) {
      this.enfocadoInicial = false;
    }
  }

  confirmar(): void {
    this.servicioModal.cerrar(true);
  }

  cancelar(): void {
    this.servicioModal.cerrar(false);
  }
}
