import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallePublicacionesComponent } from './detalle-publicaciones.component';

describe('DetallePublicacionesComponent', () => {
  let component: DetallePublicacionesComponent;
  let fixture: ComponentFixture<DetallePublicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePublicacionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePublicacionesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
