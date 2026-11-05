import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BloqueComentariosComponent } from './bloque-comentarios.component';

describe('BloqueComentariosComponent', () => {
  let component: BloqueComentariosComponent;
  let fixture: ComponentFixture<BloqueComentariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloqueComentariosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BloqueComentariosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
