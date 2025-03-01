import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaMenuComponent } from './vista-menu.component';

describe('VistaMenuComponent', () => {
  let component: VistaMenuComponent;
  let fixture: ComponentFixture<VistaMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VistaMenuComponent]
    });
    fixture = TestBed.createComponent(VistaMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
