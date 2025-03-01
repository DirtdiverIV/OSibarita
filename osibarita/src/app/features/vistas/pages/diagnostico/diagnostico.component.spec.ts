import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticoComponent } from './diagnostico.component';

describe('DiagnosticoComponent', () => {
  let component: DiagnosticoComponent;
  let fixture: ComponentFixture<DiagnosticoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiagnosticoComponent]
    });
    fixture = TestBed.createComponent(DiagnosticoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
