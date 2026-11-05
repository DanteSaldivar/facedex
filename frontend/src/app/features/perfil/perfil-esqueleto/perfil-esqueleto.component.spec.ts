import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilEsqueletoComponent } from './perfil-esqueleto.component';

describe('PerfilEsqueletoComponent', () => {
  let component: PerfilEsqueletoComponent;
  let fixture: ComponentFixture<PerfilEsqueletoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilEsqueletoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilEsqueletoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
