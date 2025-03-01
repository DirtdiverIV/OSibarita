import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaCartaComponent } from './vista-carta.component';

describe('VistaCartaComponent', () => {
  let component: VistaCartaComponent;
  let fixture: ComponentFixture<VistaCartaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VistaCartaComponent]
    });
    fixture = TestBed.createComponent(VistaCartaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
