import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaEventosComponent } from './vista-eventos.component';

describe('VistaEventosComponent', () => {
  let component: VistaEventosComponent;
  let fixture: ComponentFixture<VistaEventosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VistaEventosComponent]
    });
    fixture = TestBed.createComponent(VistaEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
