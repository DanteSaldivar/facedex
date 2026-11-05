import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EsqueletoPublicacionComponent } from './esqueleto-publicacion.component';

describe('EsqueletoPublicacionComponent', () => {
  let component: EsqueletoPublicacionComponent;
  let fixture: ComponentFixture<EsqueletoPublicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsqueletoPublicacionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EsqueletoPublicacionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
