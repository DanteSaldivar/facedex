import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalCrearPublicacionesComponent } from './modal-crear-publicaciones.component';

describe('ModalCrearPublicacionesComponent', () => {
  let component: ModalCrearPublicacionesComponent;
  let fixture: ComponentFixture<ModalCrearPublicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCrearPublicacionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCrearPublicacionesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
