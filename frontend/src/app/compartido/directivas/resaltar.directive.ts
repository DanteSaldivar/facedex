import { Directive, ElementRef, HostListener, inject, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appResaltar]',
  standalone: true
})
export class ResaltarDirective {
  private element = inject(ElementRef);
  private renderer = inject(Renderer2);

  @HostListener('mouseenter')
  alEntrar(): void {
    this.renderer.addClass(this.element.nativeElement, 'manga-hover');
  }

  @HostListener('mouseleave')
  alSalir(): void {
    this.renderer.removeClass(this.element.nativeElement, 'manga-hover');
  }
}