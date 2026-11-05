import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicacionesEsqueletoComponent } from './publicaciones-esqueleto.component';

describe('PublicacionesEsqueletoComponent', () => {
  let component: PublicacionesEsqueletoComponent;
  let fixture: ComponentFixture<PublicacionesEsqueletoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionesEsqueletoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicacionesEsqueletoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
