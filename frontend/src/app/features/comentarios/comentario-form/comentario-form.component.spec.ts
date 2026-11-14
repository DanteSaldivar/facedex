import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComentarioFormComponent } from './comentario-form.component';

describe('ComentarioFormComponent', () => {
  let component: ComentarioFormComponent;
  let fixture: ComponentFixture<ComentarioFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComentarioFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComentarioFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
